const pixData = JSON.parse(localStorage.getItem("pixData"));

if (!pixData) {
    alert("❌ Nenhum comprovante encontrado.");
    window.location.href = "/venda/compra-produtos.html";
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

    document.getElementById("codigoPedido").innerText =
        pixData.codigo_pedido || "N/D";

    document.getElementById("cpf").innerText =
        pixData.cpf || "N/D";

    document.getElementById("valor").innerText =
        `R$ ${Number(pixData.total || 0).toFixed(2).replace(".", ",")}`;

    document.getElementById("produto").innerText =
        pixData.produto_nome || "Produto";

document.getElementById("qrRetirada").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" +
    encodeURIComponent(
        pixData.qr_code_retirada ||
        pixData.codigo_pedido ||
        ""
    );

    document.getElementById("nome").innerText =
        pixData.nome || "N/D";

    document.getElementById("telefone").innerText =
        pixData.telefone || "N/D";

    document.getElementById("quantidade").innerText =
        pixData.quantidade || "1";

    document.getElementById("horarioRetirada").innerText =
        pixData.horario_retirada || "N/D";
document.getElementById("dataCompra").innerText =
    formatarDataBR(
        pixData.data_compra ||
        pixData.created_at
    );

document.getElementById("dataPagamento").innerText =
    formatarDataBR(
        pixData.data_pagamento ||
        pixData.updated_at ||
        pixData.data_pagamento_formatada
    );

const statusPagamento =
    (pixData.status_pagamento || "").toUpperCase();

document.getElementById("statusPagamento").innerText =
    statusPagamento === "PAGO"
        ? "PAGAMENTO APROVADO"
        : statusPagamento === "CANCELADO"
            ? "PAGAMENTO CANCELADO"
            : "PENDENTE";

const statusRetirada =
    (pixData.status_retirada || "").toUpperCase();

document.getElementById("statusRetirada").innerText =
    statusRetirada === "RETIRADO"
        ? "RETIRADO"
        : "NÃO RETIRADO";


}

function imprimirComprovante() {
    window.print();
}

async function compartilharComprovante() {

    try {

const elemento =
    document.getElementById("comprovante");

if (!elemento) {

    alert("Comprovante não encontrado.");

    return;

}

        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true
        });

    canvas.toBlob(async function(blob) {

    if (!blob) {

        alert("Não foi possível gerar a imagem do comprovante.");

        return;

    }

            const file = new File(
                [blob],
                "comprovante-fpss.png",
                { type: "image/png" }
            );

            if (
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {

                await navigator.share({
                    title: "Comprovante FPSS",
                    text: "Comprovante Oficial FPSS",
                    files: [file]
                });

            } else {

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "comprovante-fpss.png";
                link.click();

                alert("✅ Imagem salva. Compartilhe manualmente.");

            }

        }, "image/png");

} catch (erro) {

    console.error(
        "Erro ao compartilhar comprovante:",
        erro
    );

    alert(
        "Não foi possível compartilhar o comprovante."
    );

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

    console.error(
        "Erro ao compartilhar automaticamente:",
        erro
    );

    alert(
        "Não foi possível compartilhar o comprovante."
    );

}

    }, 1200);

}

    else if (acao === "pdf") {

        setTimeout(() => {
            window.print();
        }, 700);

    }

});