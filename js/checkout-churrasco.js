const PARAMS = new URLSearchParams(window.location.search);

const CODIGO_PRODUTO =
    PARAMS.get("produto") || "CHU";

console.log("PRODUTO SELECIONADO:", CODIGO_PRODUTO);

let PRECO_UNITARIO = 0;
let PRODUTO_ATUAL = null;
/* =====================================================
   CARREGAR PREÇO DINÂMICO
===================================================== */
async function carregarProduto() {

    try {

        const resposta = await fetch(
            `https://api.festasaosebastiao.com.br/produto/${CODIGO_PRODUTO}`
        );

        const resultado = await resposta.json();

        if (!resultado.sucesso) {

            alert("Produto não encontrado.");

            return;
        }

        PRODUTO_ATUAL = resultado.produto;

        PRECO_UNITARIO = Number(
            PRODUTO_ATUAL.preco || 0
        );

        document.getElementById(
            "tituloProduto"
        ).innerText = PRODUTO_ATUAL.nome;

        document.getElementById(
            "descricaoProduto"
        ).innerText = PRODUTO_ATUAL.descricao || "";

        document.getElementById(
            "textoPreco"
        ).innerText =
            `Valor unitário: R$ ${PRECO_UNITARIO
                .toFixed(2)
                .replace(".", ",")}`;

        const imagem =
            document.getElementById(
                "imagemProduto"
            );

        if (PRODUTO_ATUAL.imagem) {

            imagem.src =
                PRODUTO_ATUAL.imagem;

            imagem.style.display =
                "block";
        }

        calcularTotal();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao carregar produto."
        );
    }
}

/* =====================================================
   UTILITÁRIOS
===================================================== */
function limparNumero(txt){
    return String(txt || "").replace(/\D/g, "");
}

function calcularTotal(){
    const qtd = parseInt(document.getElementById("qtd").value) || 1;
    const total = qtd * PRECO_UNITARIO;

    document.getElementById("valorTotal").innerText =
        `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function mascaraCPF(input){
    let v = limparNumero(input.value).slice(0,11);

    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    input.value = v;
}

function mascaraTelefone(input){
    let v = limparNumero(input.value).slice(0,11);

    if(v.length > 10){
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }else{
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }

    input.value = v;
}

function validarCPF(cpf){
    cpf = limparNumero(cpf);
    return cpf.length === 11;
}

function validarTelefone(telefone){
    telefone = limparNumero(telefone);
    return telefone.length >= 10 && telefone.length <= 11;
}

function resetBotao(){
    const btn = document.getElementById("btnSubmit");

    btn.disabled = false;
    btn.innerText = "GERAR PIX AGORA 🚀";
}

/* =====================================================
   EVENTOS
===================================================== */
document.getElementById("qtd").addEventListener("input", calcularTotal);

document.getElementById("cpf").addEventListener("input", function(){
    mascaraCPF(this);
});

document.getElementById("telefone").addEventListener("input", function(){
    mascaraTelefone(this);
});

/* =====================================================
   BOTÃO PRINCIPAL
===================================================== */
document.getElementById("btnSubmit").addEventListener("click", async function(){

    const btn = document.getElementById("btnSubmit");

    btn.disabled = true;
    btn.innerText = "PROCESSANDO...";

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email")?.value.trim() || null;

    const quantidade = parseInt(document.getElementById("qtd").value) || 1;

    const horario_retirada = document.getElementById("horario_retirada").value;

    if(!nome || !sobrenome){
        alert("Informe nome e sobrenome.");
        resetBotao();
        return;
    }

    if(!validarCPF(cpf)){
        alert("CPF inválido.");
        resetBotao();
        return;
    }

    if(!validarTelefone(telefone)){
        alert("Telefone inválido.");
        resetBotao();
        return;
    }

    if(PRECO_UNITARIO <= 0){
        alert("Erro ao carregar preço do produto.");
        resetBotao();
        return;
    }

const dadosPedido = {
    nome,
    sobrenome,

    cpf: limparNumero(cpf),
    telefone: limparNumero(telefone),

    email,

    quantidade,

    horario_retirada,

    produto_codigo: CODIGO_PRODUTO
};

    try{

        const resposta = await fetch("https://api.festasaosebastiao.com.br/criar-pix", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosPedido)
        });

        const resultado = await resposta.json();

        console.log("RESPOSTA BACKEND:", resultado);

        if(!resposta.ok || !resultado.sucesso){

            alert("Erro: " + (resultado.erro || "Falha ao gerar pagamento."));
            resetBotao();
            return;
        }

        /* ======================================
           SALVA DADOS PARA FINALIZAR-COMPRA
        ====================================== */
localStorage.setItem("pixData", JSON.stringify({

    txid: resultado.txid,

    codigo_pedido: resultado.codigo_pedido,

    produto_tipo: resultado.produto_tipo,

    total: resultado.total,

    nome: `${nome} ${sobrenome}`.trim(),

    telefone: telefone,

    cpf: cpf,

    quantidade: quantidade,

    horario_retirada: horario_retirada,

    data_compra: new Date().toLocaleString("pt-BR"),

    // Código PIX Copia e Cola
    pix_copia_cola: resultado.pix_copia_cola,

    // Para o Sicredi usamos o mesmo texto para gerar o QR
    qr_code: resultado.pix_copia_cola

}));

        /* ======================================
           REDIRECIONA PARA COMPROVANTE NOVO
        ====================================== */
        window.location.href = "finalizar-compra.html";

    }catch(error){

        console.error("Erro fetch:", error);

        alert("Erro ao conectar com servidor: " + error.message);

        resetBotao();
    }

});

/* =====================================================
   START
===================================================== */
carregarProduto();