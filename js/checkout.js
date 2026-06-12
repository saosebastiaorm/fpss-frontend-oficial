document.getElementById("formCheckout").onsubmit = async function (e) {
    e.preventDefault();

    const btn = e.target.querySelector("button");
    btn.innerText = "Gerando PIX... ⏳";
    btn.disabled = true;

    const formData = new FormData(e.target);

    const dados = {
        nome: formData.get("nome")?.trim(),
        sobrenome: formData.get("sobrenome")?.trim(),
        cpf: formData.get("cpf")?.trim(),
        telefone: formData.get("telefone")?.trim() || "não informado",
        email: formData.get("email")?.trim() || null,
        quantidade: parseInt(formData.get("quantidade")),
        horario_retirada: formData.get("horario_retirada")
    };

    if (!dados.nome || !dados.cpf || !dados.quantidade || dados.quantidade < 1) {
        alert("❌ Preencha corretamente os campos obrigatórios.");
        btn.innerText = "GERAR PIX AGORA 🚀";
        btn.disabled = false;
        return;
    }

    try {

        const res = await fetch("https://api.festasaosebastiao.com.br/criar-pix", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await res.json();
        console.log("==================================");
        console.log("RESULTADO COMPLETO:");
        console.log(resultado);
        console.log("PIX COPIA E COLA:", resultado.qr_code);
        console.log("PIX COPIA E COLA 2:", resultado.pix_copia_cola);
        console.log("BASE64:", resultado.qr_code_base64);
        console.log("==================================");
        console.log("===== RETORNO DO BACKEND =====");
        console.log(resultado);

        console.log("PIX:", resultado);

        if (res.ok && resultado.sucesso) {
            console.log("RESULTADO DO BACKEND:");
            console.log(resultado);

localStorage.setItem("pixData", JSON.stringify({

    txid: resultado.txid,

    codigo_pedido: resultado.codigo_pedido,

    produto_tipo: resultado.produto_tipo,

    produto_codigo: resultado.produto_codigo,

    produto_nome: resultado.produto_nome,

    produto_imagem: resultado.produto_imagem,

    total: resultado.total,

    nome: `${dados.nome} ${dados.sobrenome || ""}`.trim(),

    telefone: dados.telefone,

    cpf: dados.cpf,

    quantidade: dados.quantidade,

    horario_retirada: dados.horario_retirada,

    data_compra: new Date().toLocaleString("pt-BR"),

    // PIX Copia e Cola
    pix_copia_cola:
        resultado.pix_copia_cola ||
        resultado.pixCopiaECola ||
        resultado.qr_code ||
        resultado.payload ||
        "",

    // Imagem Base64 do QR Code
    qr_code:
        resultado.qr_code_base64 || null

}));

            window.location.href = "./pagamento.html";

        } else {

            alert("❌ " + (resultado.erro || "Erro ao gerar PIX"));
        }

    } catch (err) {

        console.error("Erro conexão:", err);

        alert("🌐 Erro de conexão com o servidor.");

    } finally {

        btn.innerText = "GERAR PIX AGORA 🚀";
        btn.disabled = false;
    }
};