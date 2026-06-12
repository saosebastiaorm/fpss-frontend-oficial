document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginCliente");

  if (!form) return;

  /* ===========================================
     MÁSCARA CPF
  =========================================== */

  const campoCpf = document.getElementById("cpf");

  campoCpf.addEventListener("input", function () {

    let valor = this.value.replace(/\D/g, "");

    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    this.value = valor;

  });

  /* ===========================================
     MÁSCARA WHATSAPP
  =========================================== */

  const campoWhatsapp = document.getElementById("whatsapp");

  campoWhatsapp.addEventListener("input", function () {

    let valor = this.value.replace(/\D/g, "");

    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

    this.value = valor;

  });

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

  cpf: cpf.replace(/\D/g, ""),

  telefone: whatsapp.replace(/\D/g, "")

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

  console.error("ERRO LOGIN COMPLETO:", erro);

  alert(
    "Erro ao validar login:\n\n" +
    (erro.message || JSON.stringify(erro))
  );

}

  });

});