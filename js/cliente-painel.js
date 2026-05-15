document.addEventListener("DOMContentLoaded", () => {

  const dados = localStorage.getItem("clienteFPSS");

  if(!dados){
    alert("Faça login primeiro.");
    window.location.href = "/cliente/login.html";
    return;
  }

  const cliente = JSON.parse(dados);

  const nome = document.getElementById("clienteNome");
  const cpf = document.getElementById("clienteCPF");
  const whatsapp = document.getElementById("clienteWhatsApp");
  const pedidos = document.getElementById("clientePedidos");

  if(nome) nome.textContent = cliente.nome || "Cliente";
  if(cpf) cpf.textContent = cliente.cpf || "-";
  if(whatsapp) whatsapp.textContent = cliente.whatsapp || "-";

  if(pedidos){

    if(cliente.pedidos && cliente.pedidos.length > 0){

      pedidos.innerHTML = cliente.pedidos.map(pedido => `
        <div class="pedido-card">
          <h3>${pedido.tipo || "Pedido"}</h3>
          <p><strong>Status:</strong> ${pedido.status || "Processando"}</p>
          <p><strong>Valor:</strong> R$ ${Number(pedido.valor || 0).toFixed(2).replace(".", ",")}</p>
          <p><strong>Código:</strong> ${pedido.codigo || "-"}</p>
        </div>
      `).join("");

    } else {

      pedidos.innerHTML = `
        <div class="pedido-card">
          <p>Nenhum pedido encontrado.</p>
        </div>
      `;

    }

  }

  const logout = document.getElementById("logoutCliente");

  if(logout){
    logout.addEventListener("click", () => {
      localStorage.removeItem("clienteFPSS");
      window.location.href = "/cliente/login.html";
    });
  }

});