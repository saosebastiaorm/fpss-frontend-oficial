/* =====================================================
   FPSS LOGIN MASTER
   ARQUIVO: /js/login.js
   LOGIN + ROLE + SEGURANÇA
===================================================== */

/* =====================================================
   CONFIG SUPABASE
===================================================== */
const SUPABASE_URL = "https://gffmgqvidgswvwnhyife.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =====================================================
   ELEMENTOS
===================================================== */
const form = document.getElementById("loginForm");
const btnLogin = document.getElementById("btnLogin");
const mensagemErro = document.getElementById("mensagemErro");

/* =====================================================
   LOGIN
===================================================== */
if(form){

    form.addEventListener("submit", async function(e){

        e.preventDefault();

        mensagemErro.innerText = "";

        btnLogin.disabled = true;
        btnLogin.innerText = "ENTRANDO...";

        const email =
            document.getElementById("email")
            .value
            .trim();

        const senha =
            document.getElementById("senha")
            .value;

        try{

            /* LOGIN SUPABASE */
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: senha
                });

            if(error || !data.user){

                mensagemErro.innerText =
                    "Email ou senha inválidos.";

                resetLogin();

                return;

            }

            const userId = data.user.id;

            /* BUSCAR PERFIL */
            const {
                data: profile,
                error: profileError
            } = await supabaseClient
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if(profileError || !profile){

                mensagemErro.innerText =
                    "Perfil não autorizado.";

                await supabaseClient.auth.signOut();

                resetLogin();

                return;

            }

            /* ROLE */
            if(profile.role !== "admin"){

                mensagemErro.innerText =
                    "Acesso restrito.";

                await supabaseClient.auth.signOut();

                resetLogin();

                return;

            }

            /* STORAGE */
            localStorage.setItem(
                "fp_user_role",
                profile.role
            );

            localStorage.setItem(
                "fp_user_nome",
                profile.nome || ""
            );

            localStorage.setItem(
                "fp_user_email",
                profile.email || ""
            );

            /* REDIRECIONAR */
            window.location.href = "/admin/dashboard.html";

        }catch(error){

            console.error("Erro login:", error);

            mensagemErro.innerText =
                "Erro ao conectar.";

            resetLogin();

        }

    });

}

/* =====================================================
   RESET BOTÃO
===================================================== */
function resetLogin(){

    btnLogin.disabled = false;
    btnLogin.innerText = "ENTRAR";

}