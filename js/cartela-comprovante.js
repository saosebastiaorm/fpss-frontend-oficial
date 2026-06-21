const cartelaPixData = JSON.parse(localStorage.getItem("cartelaPixData"));

if (!cartelaPixData) {
    alert("❌ Nenhum comprovante de cartela encontrado.");
    window.location.href = "/cartelas/cartelas.html";
}

function formatarDataBR(data) {

    if (!data) return "N/D";

    try {

        return new Date(data).toLocaleString("pt-BR");

    } catch (e) {

        return data;

    }

}

function carregarComprovante() {

    const ehDigital = cartelaPixData.tipo === "digital";

    document.getElementById("tipoCartela").innerText =
        ehDigital ? "Cartela digital" : "Cartela física";

    document.getElementById("numeroCartela").innerText =
        cartelaPixData.numero_cartela || "N/D";

    document.getElementById("cpf").innerText =
        cartelaPixData.cpf || "N/D";

    document.getElementById("nome").innerText =
        cartelaPixData.nome || "N/D";

    document.getElementById("telefone").innerText =
        cartelaPixData.telefone || "N/D";

    document.getElementById("valor").innerText =
        `R$ ${Number(cartelaPixData.valor || 0).toFixed(2).replace(".", ",")}`;

    document.getElementById("vaiNaFesta").innerText =
        cartelaPixData.vai_na_festa === "sim" ? "Sim" : "Não";

    document.getElementById("dataCompra").innerText =
        formatarDataBR(cartelaPixData.data_compra);

    document.getElementById("dataPagamento").innerText =
        formatarDataBR(cartelaPixData.data_pagamento);

    document.getElementById("comprovanteId").innerText =
        cartelaPixData.comprovante_id || "N/D";

    const statusPagamento = (cartelaPixData.status_interno || "").toUpperCase();

    document.getElementById("statusPagamento").innerText =
        statusPagamento === "PAGO"
            ? "PAGAMENTO APROVADO"
            : statusPagamento === "CANCELADO"
                ? "PAGAMENTO CANCELADO"
                : "PENDENTE";

    // Bloco exclusivo de cartela digital — link pra baixar o PDF
    if (ehDigital) {
        const bloco = document.getElementById("blocoCartelaDigital");
        const link = document.getElementById("linkPdfCartela");

        if (cartelaPixData.pdf_url) {
            bloco.style.display = "block";
            link.href = cartelaPixData.pdf_url;
        }

        document.getElementById("instrucaoFisica").style.display = "none";
        document.getElementById("instrucaoDigital").style.display = "inline";
    }
}

function imprimirComprovante() {
    window.print();
}

async function compartilharComprovante() {

    try {

        const elemento = document.getElementById("comprovante");

        if (!elemento) {
            alert("Comprovante não encontrado.");
            return;
        }

        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true
        });

        canvas.toBlob(async function (blob) {

            if (!blob) {
                alert("Não foi possível gerar a imagem do comprovante.");
                return;
            }

            const file = new File(
                [blob],
                "comprovante-cartela-fpss.png",
                { type: "image/png" }
            );

            if (navigator.canShare && navigator.canShare({ files: [file] })) {

                await navigator.share({
                    title: "Comprovante de Cartela FPSS",
                    text: "Comprovante de Pagamento da Cartela FPSS",
                    files: [file]
                });

            } else {

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "comprovante-cartela-fpss.png";
                link.click();

                alert("✅ Imagem salva. Compartilhe manualmente.");
            }

        }, "image/png");

    } catch (erro) {
        console.error("Erro ao compartilhar comprovante:", erro);
        alert("Não foi possível compartilhar o comprovante.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    carregarComprovante();

    const params = new URLSearchParams(window.location.search);
    const acao = params.get("acao");

    if (acao === "whatsapp") {

        setTimeout(async () => {
            try {
                await compartilharComprovante();
            } catch (erro) {
                console.error("Erro ao compartilhar automaticamente:", erro);
                alert("Não foi possível compartilhar o comprovante.");
            }
        }, 1200);

    } else if (acao === "pdf") {

        setTimeout(() => {
            window.print();
        }, 700);
    }
});
