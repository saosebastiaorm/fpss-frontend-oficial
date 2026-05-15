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
    switch (tipo) {
      case "CHU": return "🍖 Churrasco";
      case "CAR": return "🎟️ Cartela";
      default: return tipo || "Pedido";
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

 let pedidosHTML = listaPedidos.map(pedido => {

  const statusPagamento = (pedido.status_pagamento || "").toLowerCase();
  const statusRetirada = (pedido.status_retirada || "").toLowerCase();

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
      <h3>${traduzirProduto(pedido.produto_tipo)}</h3>
      <p><strong>Status:</strong> ${traduzirStatus(pedido.status_pagamento)}</p>
      <p><strong>Valor:</strong> R$ ${Number(pedido.valor_total || 0).toFixed(2).replace(".", ",")}</p>
      <p><strong>Código:</strong> ${pedido.codigo_pedido || "-"}</p>
      <p><strong>Retirada:</strong> ${pedido.status_retirada === "retirado" ? "🎉 Retirado" : "📍 Não retirado"}</p>
    </div>
  `;

}).join("");

    pedidos.innerHTML = resumoHTML + pedidosHTML;

  }

  const logout = document.getElementById("logoutCliente");

  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("clienteFPSS");
      window.location.href = "/cliente/login.html";
    });
  }

});