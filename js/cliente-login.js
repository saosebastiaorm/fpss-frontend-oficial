document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginCliente");

  if (!form) return;

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if (!cpf || !whatsapp) {
      alert("Preencha CPF e WhatsApp.");
      return;
    }

    try {

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://api.festasaosebastiao.com.br";

const resposta = await fetch(
  `${API_URL}/cliente-login`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cpf: cpf,
      telefone: whatsapp
    })
  }
);

      const resultado = await resposta.json();

      if (resultado.sucesso) {

        localStorage.setItem(
          "clienteFPSS",
          JSON.stringify(resultado.cliente)
        );

       window.location.href = "painel.html";

      } else {

        alert(resultado.erro || "CPF ou WhatsApp não encontrados.");

      }

    } catch (erro) {

      console.error("ERRO LOGIN:", erro);

      alert("Erro ao validar login.");

    }

  });

});