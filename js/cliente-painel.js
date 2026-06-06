document.addEventListener("DOMContentLoaded", () => {

  const dados = localStorage.getItem("clienteFPSS");

  if (!dados) {
    alert("Faça login primeiro.");
    window.location.href = "/cliente/login.html";
    return;
  }

  const cliente = JSON.parse(dados);

  const nome = document.getElementById("clienteNome");
  const cpf = document.getElementById("clienteCPF");
  const whatsapp = document.getElementById("clienteWhatsApp");
  const pedidos = document.getElementById("clientePedidos");

  if (nome) nome.textContent = cliente.nome || "Cliente";
  if (cpf) cpf.textContent = cliente.cpf || "-";
  if (whatsapp) whatsapp.textContent = cliente.telefone || cliente.whatsapp || "-";

function traduzirProduto(tipo) {

  switch ((tipo || "").toUpperCase()) {

    case "CHU":
      return "🍖 Churrasco";

    case "CAR":
      return "🎟️ Cartela";

    case "POR":
      return "🚪 Portaria";

    case "BEB":
      return "🥤 Bebida";

    case "VIP":
      return "⭐ Área VIP";

    case "DOA":
      return "🙏 Doação";

    default:
      return "📦 Pedido";

  }

}

  function traduzirStatus(status) {
    switch ((status || "").toLowerCase()) {
      case "pago": return "✅ Pago";
      case "pendente": return "⏳ Pendente";
      case "cancelado": return "❌ Cancelado";
      default: return status || "Processando";
    }
  }

function gerarCardPedido(pedido) {

  const statusPagamento =
    (pedido.status_pagamento || "").toLowerCase();

  const statusRetirada =
    (pedido.status_retirada || "").toLowerCase();

  let classeStatus = "pedido-normal";

  if (statusRetirada === "retirado") {
    classeStatus = "pedido-retirado";
  } else if (statusPagamento === "pago") {
    classeStatus = "pedido-pago";
  } else if (statusPagamento === "pendente") {
    classeStatus = "pedido-pendente";
  }

  return `
  <div class="pedido-card ${classeStatus}">

    <div class="pedido-topo">

      <img
        src="${pedido.imagem_produto || 'https://via.placeholder.com/120'}"
        alt="${pedido.nome_produto || ''}"
        class="pedido-imagem"
      >

      <div class="pedido-info">

        <h3>
          ${pedido.nome_produto || traduzirProduto(pedido.produto_tipo)}
        </h3>

        <p>
          <strong>Status:</strong>
          ${traduzirStatus(pedido.status_pagamento)}
        </p>

        <p>
          <strong>Quantidade:</strong>
          ${pedido.quantidade || 1}
        </p>

        <p>
          <strong>Valor Total:</strong>
          R$ ${Number(pedido.valor_total || 0)
            .toFixed(2)
            .replace(".", ",")}
        </p>

        <p>
          <strong>Código:</strong>
          ${pedido.codigo_pedido || "-"}
        </p>

        <p>
          <strong>Data:</strong>
          ${new Date(pedido.created_at)
            .toLocaleString("pt-BR")}
        </p>

        <p>
          <strong>Retirada:</strong>
          ${
            statusRetirada === "retirado"
              ? "🎉 Retirado"
              : "📍 Não retirado"
          }
        </p>
          ${
  statusPagamento === "pago" &&
  statusRetirada !== "retirado"
    ? `
      <button
        class="btn-ver-qr"
onclick="abrirQRRetirada(
  '${pedido.qr_code_retirada}',
  '${pedido.codigo_pedido}',
  '${pedido.horario_retirada}',
  '${pedido.nome_produto}',
  '${pedido.imagem_produto}',
  '${pedido.nome} ${pedido.sobrenome}',
  '${pedido.cpf}',
  '${pedido.telefone}',
  '${pedido.quantidade || 1}'
)"
      >
        🎟 Ver QR de Retirada
      </button>
    `
    : ""
}
      </div>

    </div>

  </div>
  `;
}

  const listaPedidos = cliente.pedidos || [];

  const totalPedidos = listaPedidos.length;

  const pagos = listaPedidos.filter(
    p => (p.status_pagamento || "").toLowerCase() === "pago"
  ).length;

  const pendentes = listaPedidos.filter(
    p => (p.status_pagamento || "").toLowerCase() === "pendente"
  ).length;

  const retirados = listaPedidos.filter(
    p => (p.status_retirada || "").toLowerCase() === "retirado"
  ).length;

  const naoRetirados = listaPedidos.filter(
    p => (p.status_retirada || "").toLowerCase() !== "retirado"
  ).length;

  const totalInvestido = listaPedidos.reduce(
    (acc, p) => acc + Number(p.valor_total || 0),
    0
  );

  if (pedidos) {

    let resumoHTML = `
      <div class="pedido-card resumo-cliente">
        <h3>📊 Resumo Geral</h3>
        <p><strong>Total de pedidos:</strong> ${totalPedidos}</p>
        <p><strong>Pagos:</strong> ${pagos}</p>
        <p><strong>Pendentes:</strong> ${pendentes}</p>
        <p><strong>Total investido:</strong> R$ ${totalInvestido.toFixed(2).replace(".", ",")}</p>
        <p><strong>🎉 Retirados:</strong> ${retirados}</p>
        <p><strong>📍 Não retirados:</strong> ${naoRetirados}</p>
      </div>
    `;

 let pedidosHTML =
  listaPedidos.map(gerarCardPedido).join("");

  

    pedidos.innerHTML = resumoHTML + `<div id="listaPedidosCards">${pedidosHTML}</div>`;

const botoesFiltro = document.querySelectorAll(".filtro-btn");
const listaContainer = document.getElementById("listaPedidosCards");

botoesFiltro.forEach(botao => {
  botao.addEventListener("click", () => {

    botoesFiltro.forEach(b => b.classList.remove("ativo"));
    botao.classList.add("ativo");

    const filtro = botao.dataset.filtro;

    const pedidosFiltrados = listaPedidos.filter(pedido => {

      const statusPagamento = (pedido.status_pagamento || "").toLowerCase();
      const statusRetirada = (pedido.status_retirada || "").toLowerCase();

      if (filtro === "todos") return true;
      if (filtro === "pago") return statusPagamento === "pago";
      if (filtro === "pendente") return statusPagamento === "pendente";
      if (filtro === "retirado") return statusRetirada === "retirado";

      return true;

    });

listaContainer.innerHTML =
  pedidosFiltrados.map(gerarCardPedido).join("");

  });
});

  }

  const logout = document.getElementById("logoutCliente");

  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("clienteFPSS");
      window.location.href = "/cliente/login.html";
    });
  }

});

window.abrirQRRetirada = function(
  qrCode,
  codigoPedido,
  horario,
  produto,
  imagem,
  nome,
  cpf,
  telefone,
  quantidade
) {


  let modal =
    document.getElementById("modalQRRetirada");

  if (!modal) {

    modal = document.createElement("div");

    modal.id = "modalQRRetirada";

    modal.innerHTML = `
      <div class="modal-qr-conteudo">

        <button
          class="fechar-modal"
          onclick="document.getElementById('modalQRRetirada').remove()"
        >
          ✖
        </button>


<h2>🎟 QR de Retirada</h2>

<div class="qr-cabecalho">

  <div class="qr-lado-esquerdo">

    <img
      id="imagemProdutoQR"
      class="imagem-produto-qr"
      src="${imagem}"
      alt="${produto}"
    >

    <h3 class="titulo-produto-qr">
      ${produto}
    </h3>

    <div class="horario-retirada-box">
      🕒 HORÁRIO PREVISTO DA RETIRADA (Informado no momento da compra): ${horario}   HS
    </div>

    <div class="status-pago-box">
      ✅ PAGAMENTO CONFIRMADO
    </div>

  </div>

  <div class="qr-lado-direito">

    <div id="qrcodeCliente"></div>

    <button
      id="baixarQRBtn"
      class="btn-download-qr"
    >
      📥 Baixar QR
    </button>

    <button
  id="imprimirQRBtn"
  class="btn-imprimir-qr"
>
  🖨️ Imprimir
</button>

  </div>

</div>

<div class="dados-retirada">

<div class="dados-retirada-grid">


  <div class="dado-item">
    <strong>📄 Nº do Pedido</strong>
    <span>${codigoPedido}</span>
  </div>

  <div class="dado-item">
    <strong>📦 Quantidade</strong>
    <span>${quantidade}</span>
  </div>

  <div class="dado-item">
    <strong>👤 Nome do Comprador</strong>
    <span>${nome}</span>
  </div>

  <div class="dado-item">
    <strong>🪪 CPF do Comprador</strong>
    <span>${cpf}</span>
  </div>

  <div class="dado-item">
    <strong>📲 WhatsApp</strong>
    <span>${telefone}</span>
  </div>

</div>


</div>

<div class="aviso-retirada">
📌 Apresente este QR Code no momento da retirada.
</div>

      </div>


    `;

    document.body.appendChild(modal);
  }


  const qrContainer =
    document.getElementById("qrcodeCliente");

  qrContainer.innerHTML = "";

console.log("QR GERADO:", qrCode);
console.log(qrContainer);

new QRCode(qrContainer, {
  text: qrCode,
  width: 180,
  height: 180
});
setTimeout(() => {

  const btnDownload =
    document.getElementById("baixarQRBtn");

  btnDownload.onclick = () => {

    const imgQR =
      qrContainer.querySelector("img");

    const canvasQR =
      qrContainer.querySelector("canvas");

    let imagemFinal = null;

    if (imgQR) {
      imagemFinal = imgQR.src;
    }

    if (canvasQR) {
      imagemFinal = canvasQR.toDataURL("image/png");
    }

    if (!imagemFinal) {
      alert("QR Code não encontrado.");
      return;
    }

    const link =
      document.createElement("a");

    link.href = imagemFinal;

    link.download =
      `QR-${codigoPedido}.png`;

    link.click();

  };

}, 300);

const btnImprimir =
  document.getElementById("imprimirQRBtn");

if(btnImprimir){

  btnImprimir.onclick = () => {
document.querySelector("#baixarQRBtn")?.remove();
document.querySelector("#imprimirQRBtn")?.remove();
    const conteudo =
      document.querySelector(".modal-qr-conteudo")
      .innerHTML;

    const janela =
      window.open("", "_blank");

janela.document.write(`
<html>
<head>

<title>QR de Retirada</title>

<style>

body{
  margin:10px;
  font-family:Arial,sans-serif;
}

.imagem-produto-qr{
  width:50px !important;
  height:50px !important;
  object-fit:cover;
  border-radius:10px;
}

#qrcodeCliente img,
#qrcodeCliente canvas{
  width:140px !important;
  height:140px !important;
}

.modal-qr-conteudo{
  max-width:700px;
  margin:auto;
}

.aviso-retirada{
  background:#fff3cd;
  border:1px solid #ffe69c;
  padding:10px;
  border-radius:8px;
  font-weight:700;
  text-align:center;
  margin-top:10px;
}

@page{
  size:A4;
  margin:8mm;
}

</style>

</head>

<body>

${conteudo}

</body>
</html>
`);

    janela.document.close();

    setTimeout(() => {
      janela.print();
    }, 500);

  };

}
};