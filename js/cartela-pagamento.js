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

function gerarQr(texto) {
    document.getElementById("qrcode").innerHTML = "";

    if (!texto || texto.trim() === "") {
        document.getElementById("qrcode").innerHTML = "<b>PIX não encontrado.</b>";
        return;
    }

    new QRCode(document.getElementById("qrcode"), {
        text: texto,
        width: 150,
        height: 150
    });
}

const codigoPix = cartelaPixData.pix_copia_cola || "";
document.getElementById("pixCode").value = codigoPix;

if (cartelaPixData.qr_code) {
    document.getElementById("qrcode").innerHTML =
        `<img src="data:image/png;base64,${cartelaPixData.qr_code}" style="width:116px;">`;
} else {
    gerarQr(codigoPix);
}

function copiarPix() {
    const campo = document.getElementById("pixCode");
    campo.select();
    campo.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(campo.value);
    alert("✅ Código copiado!");
}

function gerarComprovante() {
    if ((cartelaPixData.status_interno || "").toLowerCase() !== "pago") {
        alert("Este comprovante não está disponível.");
        return;
    }
    window.open("comprovante.html", "_blank");
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

        localStorage.setItem("cartelaPixData", JSON.stringify(cartelaPixData));

        if ((dados.status_interno || "").toLowerCase() === "pago") {

            document.getElementById("statusPagamento").innerHTML = "✅ PAGAMENTO APROVADO!";
            document.getElementById("statusPagamento").style.color = "green";

            document.getElementById("btnComprovante").style.display = "block";
            document.getElementById("btnCopiarPix").style.display = "none";
            document.getElementById("labelPix").style.display = "none";
            document.getElementById("pixCode").style.display = "none";

            const ehDigital = cartelaPixData.tipo === "digital";

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
                    ? "📄 Baixe e imprima sua cartela no comprovante"
                    : "📦 Guarde o comprovante para apresentar no dia da festa";

            document.getElementById("infoFinal").innerHTML = ehDigital
                ? "⚠️ <strong>IMPORTANTE:</strong><br>Imprima a cartela disponível no comprovante e leve-a no dia do evento."
                : "⚠️ <strong>IMPORTANTE:</strong><br>Apresente o comprovante junto com a cartela física e o CPF no dia da festa.";

        } else {

            document.getElementById("statusPagamento").innerHTML = "⏳ Aguardando pagamento...";
            document.getElementById("statusPagamento").style.color = "#d62828";

            document.getElementById("btnComprovante").style.display = "none";
            document.getElementById("btnCopiarPix").style.display = "block";
            document.getElementById("labelPix").style.display = "block";
            document.getElementById("pixCode").style.display = "block";

            document.getElementById("subtituloStatus").innerHTML =
                "Escaneie o QR Code ou copie o código PIX";

            gerarQr(cartelaPixData.pix_copia_cola || "");
        }

    } catch (e) {
        console.log("Erro ao verificar pagamento da cartela.", e);
    }
}

verificarPagamento();
setInterval(verificarPagamento, 5000);
