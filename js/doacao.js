/* =====================================================
   6ª FPSS 2027 • DOACAO.JS TRADICIONAL BLINDADO
   Sem Imports • Compatibilidade Total com o Navegador
===================================================== */

(function() {
  const SCRIPT_URL_DOAR = "https://script.google.com/macros/s/AKfycbzc4p873RcAhbAegYAC1Wc1esCyhKsI8pNPhvfCYavGPBAHES3ppfeduiKdVE08IUd_/exec";

  document.addEventListener("DOMContentLoaded", function() {
    const formularioDoar = document.getElementById("formDoacao");
    const painelMensagem = document.getElementById("msg");
    const seletorTipo = document.getElementById("tipoDoacao");
    const secaoComprovante = document.getElementById("campoComprovante");
    const arquivoInput = document.getElementById("comprovante");

    if (!formularioDoar) return;

    // Controla exibição do campo de upload
    if (seletorTipo && secaoComprovante) {
      seletorTipo.addEventListener("change", function() {
        if (this.value === "Dinheiro") {
          secaoComprovante.style.display = "block";
        } else {
          secaoComprovante.style.display = "none";
        }
      });
    }

    // Função local para conversão em Base64
    function converterParaBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });
    }

    // Envio do formulário
    formularioDoar.addEventListener("submit", async function(evento) {
      evento.preventDefault();

      if (painelMensagem) {
        painelMensagem.style.color = "#333";
        painelMensagem.innerHTML = "⏳ Enviando doação...";
      }

      const dadosForm = new FormData(formularioDoar);
      dadosForm.append("origem", "DOACAO");

      try {
        if (arquivoInput && arquivoInput.files.length > 0) {
          const arquivoFisico = arquivoInput.files[0];
          const stringBase64 = await converterParaBase64(arquivoFisico);
          dadosForm.append("arquivo", stringBase64);
          dadosForm.append("nome_arquivo", arquivoFisico.name);
        }

        await fetch(SCRIPT_URL_DOAR, {
          method: "POST",
          body: dadosForm
        });

        if (painelMensagem) {
          painelMensagem.style.color = "green";
          painelMensagem.innerHTML = "✅ Doação registrada com sucesso! Muito obrigado!";
        }

        formularioDoar.reset();
        if (secaoComprovante) secaoComprovante.style.display = "none";

      } catch (falha) {
        console.error("Erro no envio da doação:", falha);
        if (painelMensagem) {
          painelMensagem.style.color = "red";
          painelMensagem.innerHTML = "❌ Erro ao enviar dados. Tente novamente.";
        }
      }
    });
  });
})();