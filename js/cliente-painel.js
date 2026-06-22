document.addEventListener("DOMContentLoaded", () => {

  const dados = localStorage.getItem("clienteFPSS");

 if (!dados) {
  alert("Faça login primeiro.");
  window.location.href = "login.html";
  return;
}

const cliente = JSON.parse(dados);

console.log("CLIENTE COMPLETO:", cliente);
console.log("PEDIDOS:", cliente.pedidos);
console.log("CARTELAS:", cliente.cartelas);

  const nome = document.getElementById("clienteNome");
  const cpf = document.getElementById("clienteCPF");
  const whatsapp = document.getElementById("clienteWhatsApp");
  const pedidos = document.getElementById("clientePedidos");

  if (nome) nome.textContent = cliente.nome || "Cliente";
  if (cpf) cpf.textContent = cliente.cpf || "-";
  if (whatsapp) whatsapp.textContent = cliente.telefone || cliente.whatsapp || "-";



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
  ${pedido.nome_produto || "📦 Produto"}
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
  <strong>Retirada:</strong>
  ${
    statusRetirada === "retirado"
      ? "🎉 Retirado"
      : "📍 Não retirado"
  }
</p>

<div class="historico-pedido">

  <div class="historico-titulo">
    📅 Histórico do Pedido
  </div>

  <div class="historico-item">
    <strong>🛒 Pedido:</strong>
    ${
      pedido.created_at
        ? new Date(pedido.created_at).toLocaleString("pt-BR")
        : "-"
    }
  </div>

  <div class="historico-item">
    <strong>💳 Pagamento:</strong>
    ${
      pedido.data_pagamento
        ? new Date(pedido.data_pagamento).toLocaleString("pt-BR")
        : "Aguardando pagamento"
    }
  </div>

  <div class="historico-item">
    <strong>🎟 Retirada:</strong>
    ${
      pedido.data_retirada
        ? new Date(pedido.data_retirada).toLocaleString("pt-BR")
        : "Não retirado"
    }
  </div>

</div>

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

${
  statusPagamento === "pendente"
    ? `
      <button
        class="btn-pagar-agora"
       onclick="abrirPixPagamento(
  '${pedido.codigo_pedido}',
  '${pedido.valor_total}',
  '${pedido.pix_copia_cola}',
  '${pedido.qr_code}',
  '${pedido.nome_produto}',
  '${pedido.imagem_produto}',
  '${pedido.quantidade || 1}',
  '${pedido.nome} ${pedido.sobrenome}',
  '${pedido.telefone}',
  '${pedido.created_at}',
  '${pedido.horario_retirada}'
)"
      >
        💳 Pagar Agora
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

  /* =====================================================
     CARTELAS DO CLIENTE — seção nova, separada dos pedidos
     de produto. Usa o container #clienteCartelas (precisa
     existir no painel.html).
  ===================================================== */

  function traduzirStatusCartela(status) {
    switch ((status || "").toLowerCase()) {
      case "pago": return "✅ Pago";
      case "pendente": return "⏳ Pendente";
      case "cancelado": return "❌ Cancelado";
      case "disponivel": return "Disponível";
      default: return status || "-";
    }
  }

  function gerarCardCartela(cartela) {

    const status = (cartela.status || "").toLowerCase();

    let classeStatus = "pedido-pendente";
    if (status === "pago") classeStatus = "pedido-pago";

    const ehDigital = cartela.tipo === "digital";

    return `
      <div class="pedido-card ${classeStatus}">

        <div class="pedido-topo">

          <div class="pedido-imagem" style="
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:42px;
            background:#fdf6ee;
          ">
            🎟️
          </div>

          <div class="pedido-info">

            <h3>${ehDigital ? "Cartela Digital" : "Cartela Física"}</h3>

            <p><strong>Status:</strong> ${traduzirStatusCartela(cartela.status)}</p>

            <p><strong>Número:</strong> ${cartela.numero_chance1 || "-"}</p>

            <p><strong>Número (chance 2):</strong> ${cartela.numero_chance2 || "-"}</p>

            <p><strong>Valor:</strong> R$ ${Number(cartela.valor_pago || 0).toFixed(2).replace(".", ",")}</p>

            <p><strong>Vai à festa:</strong> ${cartela.vai_na_festa === "sim" ? "✅ Sim" : cartela.vai_na_festa === "nao" ? "❌ Não" : "-"}</p>

            <div class="historico-pedido">
              <div class="historico-titulo">📅 Histórico</div>
              <div class="historico-item">
                <strong>💳 Pagamento:</strong>
                ${cartela.data_pagamento ? new Date(cartela.data_pagamento).toLocaleString("pt-BR") : "Aguardando pagamento"}
              </div>
            </div>

            ${
              status === "pago" && ehDigital
                ? `
                  <button class="btn-ver-qr" onclick="window.open('${cartela.pdf_url || '#'}', '_blank')">
                    📄 Ver/Baixar Cartela Digital
                  </button>
                `
                : ""
            }

            ${
              status === "pago" && !ehDigital
                ? `
                  <p style="margin-top:10px; color:#16a34a; font-weight:700;">
                    ✅ Apresente o canhoto físico no dia da festa
                  </p>
                `
                : ""
            }

          </div>

        </div>

      </div>
    `;
  }

  const cartelasContainer = document.getElementById("clienteCartelas");

  if (cartelasContainer) {

    const listaCartelas = cliente.cartelas || [];

    if (!listaCartelas.length) {
      cartelasContainer.innerHTML = `
        <p style="text-align:center; color:#888; padding:20px;">
          Você ainda não tem nenhuma cartela registrada com este CPF.
        </p>
      `;
    } else {
      cartelasContainer.innerHTML = listaCartelas.map(gerarCardCartela).join("");
    }
  }

  const logout = document.getElementById("logoutCliente");

  if (logout) {
logout.addEventListener("click", () => {
  localStorage.removeItem("clienteFPSS");
  window.location.href = "login.html";
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
      🕒 HORÁRIO PREVISTO DA RETIRADA (Informado no momento da compra): ${horario && horario !== "null" ? horario + " HS" : "Não informado"}
    </div>

    <div class="status-pago-box">
      ✅ PAGAMENTO CONFIRMADO
    </div>

  </div>

  <div class="qr-lado-direito">

    <div
    id="qrcodeCliente"
    style="
        display:flex;
        justify-content:center;
        align-items:center;
        margin:20px auto;
        padding:15px;
        background:#ffffff;
        border:1px solid #e5e5e5;
        border-radius:12px;
        width:fit-content;
        box-shadow:0 2px 8px rgba(0,0,0,.08);
    "
></div>

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

qrContainer.style.display = "flex";
qrContainer.style.justifyContent = "center";
qrContainer.style.alignItems = "center";
qrContainer.style.margin = "20px 0";

new QRCode(qrContainer, {
    text: qrCode,
    width: 240,
    height: 240
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

window.abrirPixPagamento = function(

  codigoPedido,
  valor,
  pixCopiaCola,
  qrCode,
  produto,
  imagem,
  quantidade,
  nome,
  telefone,
  dataPedido,
  horario
) {

  const modalExistente =
    document.getElementById("modalPixPagamento");

  if (modalExistente) {
    modalExistente.remove();
  }

  const modal = document.createElement("div");

  modal.id = "modalPixPagamento";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-pix-conteudo">
      <button
        class="fechar-modal"
        onclick="document.getElementById('modalPixPagamento').remove()"
      >
        ✖
      </button>

      <h2>💳 Pagamento PIX</h2>

      <div class="pix-produto-box">

  <img
    src="${imagem}"
    class="pix-produto-imagem"
  >

  <h3>${produto}</h3>

</div>

<div class="pix-info-grid">

  <div class="pix-info-item">
    <strong>📄 Pedido</strong>
    <span>${codigoPedido}</span>
  </div>

  <div class="pix-info-item">
    <strong>📦 Quantidade</strong>
    <span>${quantidade}</span>
  </div>

  <div class="pix-info-item">
    <strong>👤 Comprador</strong>
    <span>${nome}</span>
  </div>

  <div class="pix-info-item">
    <strong>📲 WhatsApp</strong>
    <span>${telefone}</span>
  </div>

  <div class="pix-info-item">
    <strong>📅 Pedido</strong>
    <span>
      ${
        dataPedido
          ? new Date(dataPedido)
              .toLocaleString("pt-BR")
          : "-"
      }
    </span>
  </div>

  <div class="pix-info-item">
    <strong>🕒 Retirada</strong>
    <span>${horario}</span>
  </div>

<div
  class="pix-info-item destaque"
  style="
    grid-column:1 / -1;
    background:#eefcf2;
    border:2px solid #2dbb55;
  "
>
  <strong
    style="
      font-size:16px;
      color:#157a35;
    "
  >
    💰 Valor Total
  </strong>

  <span
    style="
      font-size:24px;
      font-weight:700;
      color:#157a35;
    "
  >
    R$ ${Number(valor)
      .toFixed(2)
      .replace(".", ",")}
  </span>
</div>

</div>

<div
  style="
    width:100%;
    display:flex;
    justify-content:center;
    margin:25px 0;
  "
>
  <div
    id="qrcodePixPagamento"
    style="
      padding:15px;
      background:#ffffff;
      border:1px solid #e5e5e5;
      border-radius:12px;
      box-shadow:0 2px 8px rgba(0,0,0,.08);
    "
  ></div>
<div
  style="
    text-align:center;
    color:#666;
    font-size:15px;
    margin-top:-8px;
    margin-bottom:18px;
    line-height:1.6;
  "
>
    📱 Escaneie o QR Code utilizando o aplicativo do seu banco.
    <br>
    ⏳ A confirmação do pagamento pode levar alguns segundos.
</div>

</div>
<textarea
    id="pixCopiaCola"
    readonly
    style="
        width:100%;
        min-height:80px;
        margin-top:10px;
        padding:10px;
        font-size:13px;
        font-family:monospace;
        border:1px solid #d5d5d5;
        border-radius:8px;
        resize:none;
        box-sizing:border-box;
        word-break:break-all;
        overflow-wrap:anywhere;
        background:#fafafa;
    "
>
      >${pixCopiaCola}</textarea>

      <button
        onclick="copiarPix()"
        class="btn-pagar-agora"
      >
        📋 COPIAR CÓDIGO PIX
      </button>

    </div>
  `;

  document.body.appendChild(modal);

const qrContainer =
    document.getElementById("qrcodePixPagamento");

if (qrContainer) {

    qrContainer.innerHTML = "";
qrContainer.style.display = "flex";
qrContainer.style.justifyContent = "center";
qrContainer.style.alignItems = "center";
qrContainer.style.margin = "25px auto";

qrContainer.style.padding = "18px";
qrContainer.style.background = "#ffffff";
qrContainer.style.border = "2px solid #eeeeee";
qrContainer.style.borderRadius = "14px";
qrContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,.10)";
qrContainer.style.width = "fit-content";

    new QRCode(qrContainer, {
        text: pixCopiaCola || "",
        width: 240,
        height: 240
    });

}

};

window.copiarPix = function() {

  const campo =
    document.getElementById("pixCopiaCola");

  campo.select();

  document.execCommand("copy");

  alert("PIX copiado!");
};
