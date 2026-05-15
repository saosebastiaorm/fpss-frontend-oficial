document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginCliente");

  if(!form) return;

  form.addEventListener("submit", function(e){

    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();

    /* TESTE RÁPIDO TEMPORÁRIO */
    if(cpf && whatsapp){

      const clienteFake = {
        nome: "Cliente FPSS",
        cpf: cpf,
        whatsapp: whatsapp,
        pedidos: [
          {
            tipo: "Churrasco",
            status: "Pago",
            valor: 55,
            codigo: "FPSS001"
          },
          {
            tipo: "Cartela",
            status: "Reservado",
            valor: 20,
            codigo: "FPSS002"
          }
        ]
      };

      localStorage.setItem("clienteFPSS", JSON.stringify(clienteFake));

      window.location.href = "/cliente/painel.html";

    } else {

      alert("Preencha CPF e WhatsApp.");

    }

  });

});