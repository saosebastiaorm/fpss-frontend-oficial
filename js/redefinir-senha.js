/* =====================================================
   REDEFINIR SENHA FPSS
===================================================== */

const SUPABASE_URL =
    "https://gffmgqvidgswvwnhyife.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg";
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const btnSalvar = document.getElementById("btnSalvar");
const msg = document.getElementById("msg");

btnSalvar.addEventListener("click", async () => {

    msg.innerText = "";

    const senha =
        document.getElementById("senha").value;

    const confirmar =
        document.getElementById("confirmar").value;

    if (!senha || !confirmar) {

        msg.style.color = "red";
        msg.innerText =
            "Preencha todos os campos.";

        return;

    }

    if (senha !== confirmar) {

        msg.style.color = "red";
        msg.innerText =
            "As senhas não coincidem.";

        return;

    }

    const { error } =
        await supabaseClient.auth.updateUser({

            password: senha

        });

    if (error) {

        console.error(error);

        msg.style.color = "red";
        msg.innerText = error.message;

        return;

    }

    msg.style.color = "green";
    msg.innerText =
        "Senha alterada com sucesso!";

    setTimeout(() => {

        window.location.href =
            "/admin/login.html";

    }, 2000);

});