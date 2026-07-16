const API = "https://api.festasaosebastiao.com.br";

/* ===================================================
   OVERLAY DE PROCESSAMENTO
   Mostra uma tela de espera com mensagens rotativas
   enquanto o backend reserva a cartela e gera o Pix.
   Criado 100% via JS, não precisa mexer no HTML.
=================================================== */
let intervaloMensagensOverlay = null;

function criarOverlayProcessando() {
  if (document.getElementById("overlayProcessando")) return;

  if (!document.getElementById("overlayProcessandoEstilo")) {
    const estilo = document.createElement("style");
    estilo.id = "overlayProcessandoEstilo";
    estilo.textContent = `
      #overlayProcessando {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 16px;
      }
      .overlay-processando-caixa {
        background: #fffaf3;
        padding: 28px 24px;
        border-radius: 14px;
        max-width: 320px;
        width: 100%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
      .overlay-processando-spinner {
        width: 42px;
        height: 42px;
        margin: 0 auto 16px;
        border: 4px solid #f0d9b5;
        border-top-color: #8b1111;
        border-radius: 50%;
        animation: overlayProcessandoSpin 0.8s linear infinite;
      }
      #overlayProcessandoTexto {
        color: #8b1111;
        font-weight: bold;
        font-size: 15px;
        margin: 0 0 6px 0;
        line-height: 1.4;
      }
      #overlayProcessandoSubtexto {
        color: #666;
        font-size: 12px;
        margin: 0;
        line-height: 1.4;
      }
      @keyframes overlayProcessandoSpin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(estilo);
  }

  const overlay = document.createElement("div");
  overlay.id = "overlayProcessando";
  overlay.innerHTML = `
    <div class="overlay-processando-caixa">
      <div class="overlay-processando-spinner"></div>
      <p id="overlayProcessandoTexto">Reservando sua cartela...</p>
      <p id="overlayProcessandoSubtexto">Isso pode levar alguns segundos, não feche esta página.</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

function atualizarTextoOverlay(texto) {
  const el = document.getElementById("overlayProcessandoTexto");
  if (el) el.textContent = texto;
}

function removerOverlayProcessando() {
  clearInterval(intervaloMensagensOverlay);
  intervaloMensagensOverlay = null;
  const overlay = document.getElementById("overlayProcessando");
  if (overlay) overlay.remove();
}

/* ===================================================
   TROCA DE ABAS
=================================================== */
function mostrarAba(aba) {
  const ehFisica = aba === "fisica";

  document.getElementById("painelFisica").style.display = ehFisica ? "block" : "none";
  document.getElementById("painelDigital").style.display = ehFisica ? "none" : "block";

  document.getElementById("tabFisica").classList.toggle("ativo", ehFisica);
  document.getElementById("tabDigital").classList.toggle("ativo", !ehFisica);
}

/* ===================================================
   VALIDAÇÃO DO NÚMERO DA CARTELA (EM TEMPO REAL)
=================================================== */
let timeoutValidacao = null;

document.getElementById("numeroCartela").addEventListener("input", function (e) {
  const numero = e.target.value.trim();
  const feedback = document.getElementById("feedbackNumero");

  feedback.textContent = "";
  feedback.className = "cartelas-feedback-numero";

  clearTimeout(timeoutValidacao);

  if (!numero) return;

  timeoutValidacao = setTimeout(async () => {
    try {
      const res = await fetch(`${API}/cartelas/validar-numero`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero })
      });

      const resultado = await res.json();

      if (resultado.sucesso && resultado.valido) {
        feedback.textContent = "✓ Cartela encontrada — disponível para pagamento";
        feedback.classList.add("ok");
      } else {
        feedback.textContent = resultado.erro || "Cartela inválida.";
        feedback.classList.add("erro");
      }

    } catch (erro) {
      console.error("Erro ao validar número da cartela:", erro);
      feedback.textContent = "Não foi possível validar agora. Tente novamente.";
      feedback.classList.add("erro");
    }
  }, 500); // espera meio segundo após parar de digitar, evita martelar o backend
});

/* ===================================================
   ENVIO — CARTELA FÍSICA
=================================================== */
document.getElementById("formCartelaFisica").addEventListener("submit", async function (e) {
  e.preventDefault();
  await enviarFormulario(e.target, "fisica");
});

/* ===================================================
   ENVIO — CARTELA DIGITAL
=================================================== */
document.getElementById("formCartelaDigital").addEventListener("submit", async function (e) {
  e.preventDefault();
  await enviarFormulario(e.target, "digital");
});

async function enviarFormulario(form, tipo) {
  const btn = form.querySelector("button[type='submit']");
  const elementoErro = form.querySelector(".cartelas-erro");

  elementoErro.textContent = "";

  const formData = new FormData(form);

  // valida se a pessoa escolheu Sim/Não na pergunta de presença,
  // já que esse campo não vem mais pré-selecionado
  const idBlocoPresenca = tipo === "fisica" ? "presencaFisica" : "presencaDigital";
  const blocoPresenca = document.getElementById(idBlocoPresenca);
  const vaiNaFestaSelecionado = formData.get("vai_na_festa");

  if (!vaiNaFestaSelecionado) {
    if (blocoPresenca) {
      blocoPresenca.classList.add("erro");
      blocoPresenca.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    elementoErro.textContent = "Por favor, informe se você vai participar da festa.";
    return;
  } else if (blocoPresenca) {
    blocoPresenca.classList.remove("erro");
  }

  const textoOriginal = btn.textContent;
  btn.textContent = "Gerando Pix...";
  btn.disabled = true;

  const dados = {
    nome: formData.get("nome")?.trim(),
    cpf: formData.get("cpf")?.trim(),
    telefone: formData.get("telefone")?.trim(),
    vai_na_festa: formData.get("vai_na_festa")
  };

  if (tipo === "fisica") {
    dados.numero_cartela = formData.get("numero_cartela")?.trim();
  }

  if (tipo === "digital") {
    // Endereço — necessário na cartela digital (não existe canhoto físico
    // com esses dados, diferente da cartela física)
    dados.cep = formData.get("cep")?.trim();
    dados.cidade = formData.get("cidade")?.trim();
    dados.bairro = formData.get("bairro")?.trim();
    dados.rua = formData.get("rua")?.trim();
    dados.numero_endereco = formData.get("numero_endereco")?.trim();
  }

  const endpoint = tipo === "fisica" ? "/cartelas/pix-fisica" : "/cartelas/pix-digital";

  // Mensagens rotativas do overlay — diferentes pra física e digital,
  // já que na digital envolve reservar um número novo no banco.
  const mensagensOverlay = tipo === "digital"
    ? [
        "Reservando sua cartela digital...",
        "Confirmando disponibilidade do número...",
        "Gerando o código Pix...",
        "Quase lá..."
      ]
    : [
        "Confirmando sua cartela física...",
        "Gerando o código Pix...",
        "Quase lá..."
      ];

  criarOverlayProcessando();
  let indiceMensagemOverlay = 0;
  atualizarTextoOverlay(mensagensOverlay[0]);
  intervaloMensagensOverlay = setInterval(() => {
    indiceMensagemOverlay = (indiceMensagemOverlay + 1) % mensagensOverlay.length;
    atualizarTextoOverlay(mensagensOverlay[indiceMensagemOverlay]);
  }, 1800);

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await res.json();

    if (res.ok && resultado.sucesso) {

      localStorage.setItem("cartelaPixData", JSON.stringify({
        txid: resultado.txid,
        numero_cartela: resultado.numero_cartela,
        numero_chance2: resultado.numero_chance2,
        tipo: resultado.tipo,
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.telefone,
        valor: resultado.valor,
        data_compra: new Date().toLocaleString("pt-BR"),
        pix_copia_cola: resultado.pixCopiaECola || "",
        qr_code: resultado.qrCode || null
      }));

      // Não remove o overlay aqui de propósito — a página vai mudar
      // (redirect), então ele some junto com a troca de tela.
      window.location.href = "/cartelas/pagamento.html";
      return;

    } else {
      removerOverlayProcessando();
      elementoErro.textContent = resultado.erro || "Erro ao gerar Pix.";
    }

  } catch (erro) {
    removerOverlayProcessando();
    console.error("Erro de conexão:", erro);
    elementoErro.textContent = "Erro de conexão com o servidor. Tente novamente.";

  } finally {
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
}

/* ===================================================
   Remove o destaque de erro assim que a pessoa escolhe
   uma opção de presença (sem precisar tentar enviar de novo)
=================================================== */
document.querySelectorAll('input[name="vai_na_festa"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const bloco = radio.closest(".cartelas-presenca");
    if (bloco) bloco.classList.remove("erro");
  });
});
