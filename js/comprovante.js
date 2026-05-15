const pixData = JSON.parse(localStorage.getItem("pixData"));

if (!pixData) {
    alert("❌ Nenhum comprovante encontrado.");
    window.location.href = "/venda/compra-churrasco.html";
}

function carregarComprovante() {

    document.getElementById("codigoPedido").innerText =
        pixData.codigo_pedido || "N/D";

    document.getElementById("cpf").innerText =
        pixData.cpf || "N/D";

    document.getElementById("valor").innerText =
        `R$ ${Number(pixData.total || 0).toFixed(2).replace(".", ",")}`;

    document.getElementById("produto").innerText =
        pixData.produto_tipo || "Churrasco";

    document.getElementById("qrRetirada").src =
        "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" +
        encodeURIComponent(pixData.codigo_pedido || "");
}

function imprimirComprovante() {
    window.print();
}

async function compartilharComprovante() {

    try {

        const elemento = document.getElementById("comprovante");

        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true
        });

        canvas.toBlob(async function(blob) {

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

    } catch (e) {

        alert("Erro ao compartilhar comprovante.");

    }

}

window.onload = carregarComprovante;