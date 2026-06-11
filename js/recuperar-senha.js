/* =====================================================
   RECUPERAR SENHA FPSS
===================================================== */

const SUPABASE_URL = "https://gffmgqvidgswvwnhyife.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const btnEnviar = document.getElementById("btnEnviar");
const msg = document.getElementById("msg");

btnEnviar.addEventListener("click", async () => {

    msg.innerText = "";

    const email = document
        .getElementById("email")
        .value
        .trim();

    if (!email) {

        msg.style.color = "red";
        msg.innerText = "Informe seu e-mail.";

        return;

    }

    const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
            email,
            {
redirectTo:
    window.location.origin +
    "/fpss-frontend/admin/redefinir-senha.html"
            }
        );

    if (error) {

        console.error(error);

        msg.style.color = "red";
        msg.innerText = error.message;

        return;

    }

    msg.style.color = "green";
    msg.innerText =
        "Enviamos um link para redefinição da senha para seu e-mail.";

});