const API = "https://api.festasaosebastiao.com.br";

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

      window.location.href = "/cartelas/pagamento.html";

    } else {
      elementoErro.textContent = resultado.erro || "Erro ao gerar Pix.";
    }

  } catch (erro) {
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
