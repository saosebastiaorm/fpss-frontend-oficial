(function(){

/* =====================================================
   FPSS MASTER
   FORMULÁRIOS OFICIAIS
===================================================== */

/* =========================
   ELEMENTOS
========================= */
const campoQtd = document.getElementById("quantidadePedido");
const campoNome = document.getElementById("nomeCliente");
const campoTelefone = document.getElementById("telefoneCliente");
const campoHorario = document.getElementById("horarioRetirada");
const boxTotal = document.getElementById("valorTotal");

/* =========================
   CONFIGURAÇÃO
========================= */
const PRECO = 60;
const PIX_CHAVE = "6999900-5245";

/* =========================
   FORMATA MOEDA
========================= */
function moeda(v){
  return "R$ " + v.toFixed(2).replace(".",",");
}

/* =========================
   LIMPAR NÚMEROS
========================= */
function limparNumero(txt){
  return String(txt || "").replace(/\D/g, "");
}

/* =========================
   ATUALIZA TOTAL
========================= */
function atualizarTotal(){

  if(!campoQtd || !boxTotal) return;

  let qtd = parseInt(campoQtd.value);

  if(isNaN(qtd) || qtd < 1){
    qtd = 1;
    campoQtd.value = 1;
  }

  const total = qtd * PRECO;

  boxTotal.textContent = moeda(total);

}

/* =========================
   VALIDA HORÁRIO
========================= */
function horarioValido(h){

  if(!h) return false;

  return h >= "09:00" && h <= "14:00";

}

/* =========================
   EVENTO QUANTIDADE
========================= */
if(campoQtd){
  campoQtd.addEventListener("input", atualizarTotal);
  atualizarTotal();
}

/* =========================
   MÁSCARA TELEFONE
========================= */
if(campoTelefone){

  campoTelefone.addEventListener("input", function(){

    let v = limparNumero(this.value).slice(0,11);

    if(v.length > 10){
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    }else if(v.length > 6){
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    }else if(v.length > 2){
      v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }else{
      v = v.replace(/^(\d*)/, "($1");
    }

    this.value = v;

  });

}

/* =========================
   WHATSAPP PEDIDO
========================= */
window.enviarPedidoWhats = function(){

  const nome = campoNome ? campoNome.value.trim() : "";
  const telefone = campoTelefone ? campoTelefone.value.trim() : "";
  const horario = campoHorario ? campoHorario.value.trim() : "";

  let qtd = campoQtd ? parseInt(campoQtd.value) : 1;

  if(isNaN(qtd) || qtd < 1){
    qtd = 1;
  }

  if(nome === ""){
    alert("Informe seu nome.");
    campoNome?.focus();
    return;
  }

  if(telefone === ""){
    alert("Informe seu telefone.");
    campoTelefone?.focus();
    return;
  }

  if(!horarioValido(horario)){
    alert("Horário inválido. Escolha entre 09:00 e 14:00.");
    campoHorario?.focus();
    return;
  }

  const total = qtd * PRECO;

  const msg =
    "🔥 PEDIDO CHURRASCO FPSS%0A%0A" +
    "👤 Nome: " + nome + "%0A" +
    "📞 Telefone: " + telefone + "%0A" +
    "🍖 Quantidade: " + qtd + "%0A" +
    "⏰ Retirada: " + horario + "%0A%0A" +
    "💳 PIX: " + PIX_CHAVE + "%0A%0A" +
    "💰 Total: " + moeda(total) + "%0A%0A" +
    "📎 Após pagamento, envie o comprovante aqui no WhatsApp.";

  window.open(
    "https://wa.me/556992014424?text=" + msg,
    "_blank"
  );

};

/* =========================
   GERAR PIX (BACKEND)
========================= */
window.gerarPix = async function(){

  const nome = campoNome ? campoNome.value.trim() : "";
  const sobrenome = document.getElementById("sobrenome") ? document.getElementById("sobrenome").value.trim() : "";
  const cpf = document.getElementById("cpf") ? document.getElementById("cpf").value.trim() : "";
  const telefone = campoTelefone ? campoTelefone.value.trim() : "";
  const email = document.getElementById("email") ? document.getElementById("email").value.trim() : null;

  let qtd = campoQtd ? parseInt(campoQtd.value) : 1;

  if(isNaN(qtd) || qtd < 1){
    qtd = 1;
  }

  if(nome === ""){
    alert("Informe seu nome.");
    campoNome?.focus();
    return;
  }

  if(cpf === ""){
    alert("Informe seu CPF.");
    document.getElementById("cpf")?.focus();
    return;
  }

  if(telefone === ""){
    alert("Informe seu telefone.");
    campoTelefone?.focus();
    return;
  }

  try{

    const res = await fetch("https://api.festasaosebastiao.com.br/criar-pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        sobrenome,
        cpf: limparNumero(cpf),
        telefone: limparNumero(telefone),
        email,
        quantidade: qtd
      })
    });

    const data = await res.json();

    if(!res.ok || !data.sucesso){
      alert("Erro: " + (data.erro || "Falha ao gerar PIX"));
      return;
    }

    localStorage.setItem("pixData", JSON.stringify({
      codigo_pedido: data.codigo_pedido,
      produto_tipo: data.produto_tipo,
      total: data.total,
      cpf: cpf,
      pix_copia_cola: data.qr_code,
      qr_code: data.qr_code_base64 || data.pix_copia_cola
    }));

    window.location.href = "./finalizar-compra.html";

  }catch(e){

    console.error(e);

    alert("Erro ao gerar Pix. Verifique conexão com servidor.");

  }

};

})();