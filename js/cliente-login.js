document.getElementById("loginCliente").addEventListener("submit", function(e){
    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if(!cpf || !whatsapp){
        alert("Preencha CPF e WhatsApp.");
        return;
    }

    localStorage.setItem("cliente_cpf", cpf);
    localStorage.setItem("cliente_whatsapp", whatsapp);

    window.location.href = "painel.html";
});