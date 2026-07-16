const API = "https://api.festasaosebastiao.com.br";

const cartelaPixData = JSON.parse(localStorage.getItem("cartelaPixData"));

if (!cartelaPixData) {
    alert("❌ Nenhum pagamento de cartela encontrado.");
    window.location.href = "cartelas.html";
}

function preencherDadosCartela() {

    const ehDigital = cartelaPixData.tipo === "digital";

    document.getElementById("cartelaTipo").innerText =
        ehDigital ? "Cartela digital" : "Cartela física";

    document.getElementById("cartelaNumero").innerText =
        cartelaPixData.numero_cartela || "--";

    document.getElementById("cartelaValor").innerText =
        `R$ ${Number(cartelaPixData.valor || 0).toFixed(2).replace(".", ",")}`;

    document.getElementById("codigoPedido").innerText =
        cartelaPixData.numero_cartela || "N/D";
}

preencherDadosCartela();

/* ===================================================
   CONTADOR REGRESSIVO — mostra quanto tempo falta antes
   da reserva expirar (1h, mesmo prazo do Pix da Sicredi)
=================================================== */
let intervaloContador = null;

function iniciarContadorExpiracao() {

    const elemento = document.getElementById("contadorExpira");
    if (!elemento || !cartelaPixData.expira_em) return;

    const expiraEm = new Date(cartelaPixData.expira_em).getTime();

    function atualizar() {

        // Se já está pago, ou já mostrando expirado, não precisa mais do contador
        if ((cartelaPixData.status_interno || "").toLowerCase() === "pago") {
            elemento.textContent = "";
            clearInterval(intervaloContador);
            return;
        }

        const restanteMs = expiraEm - Date.now();

        if (restanteMs <= 0) {
            elemento.textContent = "";
            clearInterval(intervaloContador);
            return;
        }

        const minutos = Math.floor(restanteMs / 60000);
        const segundos = Math.floor((restanteMs % 60000) / 1000);
        const textoTempo = `${minutos}:${String(segundos).padStart(2, "0")}`;

        elemento.textContent = `⏱️ Essa reserva expira em ${textoTempo} — pague antes desse prazo`;
        elemento.classList.toggle("perto-de-expirar", restanteMs < 5 * 60 * 1000);
    }

    atualizar();
    intervaloContador = setInterval(atualizar, 1000);
}

iniciarContadorExpiracao();

function gerarQr(texto) {
    document.getElementById("qrcode").innerHTML = "";

    if (!texto || texto.trim() === "") {
        document.getElementById("qrcode").innerHTML = "<b>PIX não encontrado.</b>";
        return;
    }

    new QRCode(document.getElementById("qrcode"), {
        text: texto,
        width: 130,
        height: 130
    });
}

const codigoPix = cartelaPixData.pix_copia_cola || "";
document.getElementById("pixCode").value = codigoPix;

if (cartelaPixData.qr_code) {
    document.getElementById("qrcode").innerHTML =
        `<img src="data:image/png;base64,${cartelaPixData.qr_code}" style="width:100px;">`;
} else {
    gerarQr(codigoPix);
}

function copiarPix() {
    const campo = document.getElementById("pixCode");
    campo.select();
    campo.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(cartelaPixData.pix_copia_cola || campo.value);
    alert("✅ Código copiado!");
}

function gerarComprovante() {
    if ((cartelaPixData.status_interno || "").toLowerCase() !== "pago") {
        alert("Este comprovante não está disponível.");
        return;
    }
    window.open("comprovante.html", "_blank");
}

function verCartelaDigital() {
    if (!cartelaPixData.pdf_url) {
        alert("Sua cartela ainda está sendo gerada, aguarde mais alguns instantes.");
        return;
    }
    window.open(cartelaPixData.pdf_url, "_blank");
}

async function verificarPagamento() {

    if (!cartelaPixData.txid) return;

    try {

        const res = await fetch(`${API}/cartelas/verificar-pagamento/${cartelaPixData.txid}`);
        const dados = await res.json();

        if (!dados.sucesso) return;

        cartelaPixData.status_interno = dados.status_interno || "";
        cartelaPixData.data_pagamento = dados.data_pagamento || cartelaPixData.data_pagamento || null;
        cartelaPixData.comprovante_id = dados.cartela?.comprovante_id || cartelaPixData.comprovante_id || null;
        cartelaPixData.pdf_url = dados.cartela?.pdf_url || cartelaPixData.pdf_url || null;

        localStorage.setItem("cartelaPixData", JSON.stringify(cartelaPixData));

        const avisoProcessando = document.getElementById("avisoProcessando");
        const avisoGerandoCartela = document.getElementById("avisoGerandoCartela");
        const contadorExpira = document.getElementById("contadorExpira");
        const ehDigital = cartelaPixData.tipo === "digital";

        /* ===== RESERVA EXPIRADA (não pagou a tempo) ===== */
        if ((dados.status_interno || "").toLowerCase() === "expirado") {

            clearInterval(intervaloContador);
            if (contadorExpira) contadorExpira.textContent = "";
            if (avisoProcessando) avisoProcessando.style.display = "none";
            if (avisoGerandoCartela) avisoGerandoCartela.style.display = "none";

            document.getElementById("statusPagamento").innerHTML =
                "⚠️ RESERVA EXPIRADA";
            document.getElementById("statusPagamento").style.color = "#d62828";

            document.getElementById("btnComprovante").style.display = "none";
            document.getElementById("btnVerCartela").style.display = "none";
            document.getElementById("btnCopiarPix").style.display = "none";
            document.getElementById("labelPix").style.display = "none";
            document.getElementById("pixCode").style.display = "none";

            document.getElementById("qrcode").innerHTML = `
                <div style="padding:18px; text-align:center; color:#8b1111; font-weight:bold;">
                    ⚠️ O tempo pra pagar essa cartela esgotou e ela foi liberada.<br>
                    <span style="font-weight:normal; font-size:13px;">
                        Não se preocupe, é só gerar um novo Pix pra tentar de novo.
                    </span>
                </div>
            `;

            document.getElementById("subtituloStatus").innerHTML =
                "Reserva expirada";

            const infoFinalExpirado = document.getElementById("infoFinal");
            if (infoFinalExpirado) {
                infoFinalExpirado.innerHTML = `
                    <div style="text-align:center;">
                        <button class="btn btn-copiar" onclick="window.location.href='/cartelas/cartelas.html'">
                            🔄 GERAR NOVO PIX
                        </button>
                    </div>
                `;
            }

            return;
        }

        if ((dados.status_interno || "").toLowerCase() === "pago") {

            // Cartela digital confirmada mas a arte ainda não terminou de
            // ser gerada/enviada (raro, mas pode acontecer) — avisa que já
            // pagou e que falta só a etapa final, sem mostrar botões ainda.
            const aindaGerandoCartela = ehDigital && !cartelaPixData.pdf_url;

            if (avisoProcessando) avisoProcessando.style.display = "none";

            if (aindaGerandoCartela) {

                if (avisoGerandoCartela) avisoGerandoCartela.style.display = "block";

                document.getElementById("statusPagamento").innerHTML = "✅ Pagamento confirmado!";
                document.getElementById("statusPagamento").style.color = "green";

                document.getElementById("btnComprovante").style.display = "none";
                document.getElementById("btnVerCartela").style.display = "none";
                document.getElementById("btnCopiarPix").style.display = "none";
                document.getElementById("labelPix").style.display = "none";
                document.getElementById("pixCode").style.display = "none";

                document.getElementById("subtituloStatus").innerHTML =
                    "🎟️ Gerando sua cartela digital...";

                return;
            }

            if (avisoGerandoCartela) avisoGerandoCartela.style.display = "none";

            document.getElementById("statusPagamento").innerHTML = "✅ PAGAMENTO APROVADO!";
            document.getElementById("statusPagamento").style.color = "green";

            clearInterval(intervaloContador);
            if (contadorExpira) contadorExpira.textContent = "";

            document.getElementById("btnComprovante").style.display = "block";
            document.getElementById("btnVerCartela").style.display = ehDigital ? "block" : "none";
            document.getElementById("btnCopiarPix").style.display = "none";
            document.getElementById("labelPix").style.display = "none";
            document.getElementById("pixCode").style.display = "none";

            document.getElementById("qrcode").innerHTML = `
                <div style="
                    padding:18px;
                    text-align:center;
                    color:#1d5f1d;
                    font-weight:bold;
                ">
                    ✅ Cartela nº ${cartelaPixData.numero_cartela} confirmada
                </div>
            `;

            document.getElementById("subtituloStatus").innerHTML =
                ehDigital
                    ? "📄 Visualize sua cartela ou o comprovante nos botões acima"
                    : "📦 Guarde o comprovante para apresentar no dia da festa";

            document.getElementById("infoFinal").innerHTML = ehDigital
                ? "⚠️ <strong>IMPORTANTE:</strong><br>Salve ou imprima sua cartela e leve-a no dia do evento."
                : "⚠️ <strong>IMPORTANTE:</strong><br>Apresente o comprovante junto com a cartela física e o CPF no dia da festa.";

        } else {

            document.getElementById("statusPagamento").innerHTML = "⏳ Aguardando pagamento...";
            document.getElementById("statusPagamento").style.color = "#d62828";

            document.getElementById("btnComprovante").style.display = "none";
            document.getElementById("btnVerCartela").style.display = "none";
            document.getElementById("btnCopiarPix").style.display = "block";
            document.getElementById("labelPix").style.display = "block";
            document.getElementById("pixCode").style.display = "block";

            if (avisoProcessando) avisoProcessando.style.display = "block";
            if (avisoGerandoCartela) avisoGerandoCartela.style.display = "none";

            document.getElementById("subtituloStatus").innerHTML =
                "Escaneie o QR Code ou copie o código PIX";

            gerarQr(cartelaPixData.pix_copia_cola || "");
        }

    } catch (e) {
        console.log("Erro ao verificar pagamento da cartela.", e);
    }
}

/* ===================================================
   Verifica na hora quando a aba/janela volta a ficar em
   primeiro plano — evita esperar até 5s a mais (ou minutos,
   já que navegadores pausam o setInterval em segundo plano
   enquanto a pessoa está no app do banco pagando).
=================================================== */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) verificarPagamento();
});

window.addEventListener("focus", () => {
  verificarPagamento();
});

/* ===================================================
   Se a pessoa usar o botão "voltar" do navegador pra chegar
   nesta página (ela pode vir do cache — bfcache), força uma
   nova checagem imediata, garantindo que o status mostrado
   nunca fique desatualizado.
=================================================== */
window.addEventListener("pageshow", (evento) => {
  if (evento.persisted) verificarPagamento();
});

verificarPagamento();
setInterval(verificarPagamento, 5000);
