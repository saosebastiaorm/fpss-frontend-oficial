const API_BASE = "https://fpss-backend.onrender.com";

let pedidoAtual = null;

/* =========================================
   BUSCAR PEDIDO
========================================= */
async function buscarPedido() {

  const termo = document.getElementById("busca").value.trim();
  const erro = document.getElementById("erro");
  const resultado = document.getElementById("resultado");

  erro.innerHTML = "";
  resultado.style.display = "none";

  if (!termo) {
    erro.innerHTML = "❌ Informe código ou CPF.";
    return;
  }

  try {

    let url = "";
    let buscaPorCodigo = false;

    if (termo.toUpperCase().startsWith("FPSS-")) {

      buscaPorCodigo = true;
      url = `${API_BASE}/pedido/codigo/${encodeURIComponent(termo)}`;

    } else {

      url = `${API_BASE}/pedido/cpf/${termo.replace(/\D/g,'')}`;
    }

    const res = await fetch(url);
    const dados = await res.json();

    if (!dados.sucesso) {
      erro.innerHTML = "❌ Pedido não encontrado.";
      return;
    }

    /* =========================================
       BUSCA POR CÓDIGO
    ========================================= */
    if (buscaPorCodigo) {

      pedidoAtual = dados.pedido;

      if (pedidoAtual.payment_id) {

        try {

          const pagamentoRes = await fetch(
            `${API_BASE}/verificar-pagamento/${pedidoAtual.payment_id}`
          );

          const pagamentoDados = await pagamentoRes.json();

          if (pagamentoDados.sucesso) {
            pedidoAtual.status_pagamento = pagamentoDados.status_interno;
          }

        } catch (e) {
          console.log("Falha ao verificar pagamento.");
        }
      }

      resultado.style.display = "block";

      resultado.innerHTML = `
        <h2>✅ Pedido Localizado</h2>

        <div class="linha"><strong>Nome:</strong> ${pedidoAtual.nome} ${pedidoAtual.sobrenome || ""}</div>

        <div class="linha"><strong>Código:</strong> ${pedidoAtual.codigo_pedido}</div>

        <div class="linha"><strong>CPF:</strong> ${pedidoAtual.cpf}</div>

        <div class="linha"><strong>Telefone:</strong> ${pedidoAtual.telefone || "Não informado"}</div>

        <div class="linha"><strong>Quantidade:</strong> ${pedidoAtual.quantidade}</div>

        <div class="linha"><strong>Horário:</strong> ${pedidoAtual.horario_retirada || "Não definido"}</div>

        <div class="linha">
          <strong>Status Pagamento:</strong>
          <span class="${
            pedidoAtual.status_pagamento === "pago"
              ? "status-pago"
              : "status-pendente"
          }">
            ${pedidoAtual.status_pagamento}
          </span>
        </div>

        <div class="linha">
          <strong>Status Retirada:</strong>
          <span class="${
            pedidoAtual.status_retirada === "retirado"
              ? "status-retirado"
              : "ok"
          }">
            ${pedidoAtual.status_retirada}
          </span>
        </div>

        ${
          pedidoAtual.status_retirada === "retirado"
            ? `<p class="erro">⚠️ Pedido já retirado.</p>`
            : pedidoAtual.status_pagamento !== "pago"
              ? `<p class="erro">⚠️ Pagamento pendente. Entrega bloqueada.</p>`
              : `<button class="retirar" onclick="confirmarRetirada()">✅ CONFIRMAR ENTREGA</button>`
        }

        <div class="alerta">
          ⚠️ Confirme nome + CPF antes de entregar.<br>
          Sem pagamento aprovado, a entrega permanece bloqueada.
        </div>
      `;

    } else {

      /* =========================================
         BUSCA POR CPF (MÚLTIPLOS)
      ========================================= */

      const pedidos = dados.pedidos;

      resultado.style.display = "block";

      resultado.innerHTML = `
        <h2>📋 Pedidos encontrados (${pedidos.length})</h2>

        ${pedidos.map(pedido => `
          <div style="
            border:1px solid #ddd;
            border-radius:10px;
            padding:12px;
            margin-bottom:12px;
            background:${
              pedido.status_retirada === "retirado"
                ? "#ffe5e5"
                : pedido.status_pagamento === "pago"
                  ? "#e8f7e8"
                  : "#fff8d6"
            };
          ">

            <div><strong>Nome:</strong> ${pedido.nome} ${pedido.sobrenome || ""}</div>

            <div><strong>Código:</strong> ${pedido.codigo_pedido}</div>

            <div><strong>Quantidade:</strong> ${pedido.quantidade}</div>

            <div><strong>Horário:</strong> ${pedido.horario_retirada || "Não definido"}</div>

            <div><strong>Pagamento:</strong> ${pedido.status_pagamento}</div>

            <div><strong>Retirada:</strong> ${pedido.status_retirada}</div>

            ${
              pedido.status_retirada === "retirado"
                ? `<div class="bloqueio">⚠️ Já retirado</div>`
                : pedido.status_pagamento !== "pago"
                  ? `<div class="bloqueio">⚠️ Pagamento pendente</div>`
                  : `<button onclick="confirmarRetiradaPorCodigo('${pedido.codigo_pedido}')">✅ Confirmar Retirada</button>`
            }

          </div>
        `).join("")}
      `;
    }

  } catch (e) {

    erro.innerHTML = "❌ Erro ao buscar pedido.";
  }
}

/* =========================================
   CONFIRMAR RETIRADA INDIVIDUAL
========================================= */
async function confirmarRetirada() {

  if (!pedidoAtual) return;

  const confirmar = confirm(
    `Confirmar entrega para ${pedidoAtual.nome}?\n\nCódigo: ${pedidoAtual.codigo_pedido}`
  );

  if (!confirmar) return;

  try {

    const res = await fetch(
      `${API_BASE}/retirada/${pedidoAtual.codigo_pedido}`,
      {
        method:"POST"
      }
    );

    const dados = await res.json();

    if (dados.sucesso) {

      alert("✅ Retirada confirmada com sucesso!");

      buscarPedido();

    } else {

      alert("❌ " + dados.erro);
    }

  } catch (e) {

    alert("❌ Erro ao confirmar retirada.");
  }
}

/* =========================================
   CONFIRMAR RETIRADA POR CÓDIGO
========================================= */
async function confirmarRetiradaPorCodigo(codigoPedido) {

  const confirmar = confirm(
    `Confirmar retirada do pedido ${codigoPedido}?`
  );

  if (!confirmar) return;

  try {

    const res = await fetch(
      `${API_BASE}/retirada/${codigoPedido}`,
      {
        method:"POST"
      }
    );

    const dados = await res.json();

    if (dados.sucesso) {

      alert("✅ Retirada confirmada com sucesso!");

      buscarPedido();

    } else {

      alert("❌ " + dados.erro);
    }

  } catch (e) {

    alert("❌ Erro ao confirmar retirada.");
  }
}

/* =========================================
   ENTER PARA BUSCA
========================================= */
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("busca").addEventListener("keypress", function(e){
    if(e.key === "Enter"){
      buscarPedido();
    }
  });

});

/* =========================================
   QR + CÂMERA
========================================= */
let html5QrCode = null;
let currentCameraIndex = 0;
let scannerAtivo = false;

function processarCodigoLido(decodedText) {

  try {

    const codigo = decodedText.split("|")[0].trim();

    document.getElementById("busca").value = codigo;

    html5QrCode.stop().then(async () => {

      scannerAtivo = false;

      document.getElementById("scannerArea").style.display = "none";

      setTimeout(() => {

        document.querySelector(".buscar").click();

        setTimeout(() => {

          const resultado = document.getElementById("resultado");

          if (resultado) {

            resultado.classList.add("resultado-destaque");

            resultado.scrollIntoView({
              behavior:"smooth",
              block:"start"
            });

            setTimeout(() => {
              resultado.classList.remove("resultado-destaque");
            }, 2500);

          }

        }, 700);

      }, 500);

    });

  } catch (e) {

    console.log("ERRO QR:", e);

    alert("❌ QR inválido.");
  }
}

async function toggleScanner() {

  const scannerArea = document.getElementById("scannerArea");

  if (scannerAtivo) {

    try {
      if (html5QrCode) {
        await html5QrCode.stop();
        await html5QrCode.clear();
      }
    } catch(e){}

    html5QrCode = null;
    scannerArea.style.display = "none";
    scannerAtivo = false;

    return;
  }

  scannerArea.style.display = "block";

  try {

    html5QrCode = new Html5Qrcode("reader");

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps:10,
        qrbox:{ width:220, height:220 }
      },
      processarCodigoLido
    );

    currentCameraIndex = 0;
    scannerAtivo = true;

  } catch (err) {

    console.log("ERRO CAMERA:", err);

    alert("❌ Erro ao iniciar câmera. Verifique permissão do navegador.");
  }
}

async function trocarCamera() {

  if (!scannerAtivo) {
    alert("❌ Ative a câmera primeiro.");
    return;
  }

  try {

    const novoModo =
      currentCameraIndex === 0 ? "user" : "environment";

    currentCameraIndex =
      currentCameraIndex === 0 ? 1 : 0;

    await html5QrCode.stop();
    await html5QrCode.clear();

    html5QrCode = new Html5Qrcode("reader");

    await html5QrCode.start(
      { facingMode: novoModo },
      {
        fps:10,
        qrbox:{ width:220, height:220 }
      },
      processarCodigoLido
    );

  } catch (err) {

    console.log("ERRO TROCAR CAMERA:", err);

    alert("❌ Erro ao trocar câmera.");
  }
}

/* =========================================
   LIMPAR TELA
========================================= */
async function limparTela() {

  document.getElementById("busca").value = "";
  document.getElementById("erro").innerHTML = "";

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";
  resultado.style.display = "none";

  if (scannerAtivo && html5QrCode) {
    try {
      await html5QrCode.stop();
      await html5QrCode.clear();
    } catch(e){}
    scannerAtivo = false;
  }

  const scannerArea = document.getElementById("scannerArea");

  if (scannerArea) {
    scannerArea.style.display = "none";
  }
}