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

/* =====================================================
   GARANTIR SESSÃO A PARTIR DO LINK DO E-MAIL
   O Supabase pode mandar o token de duas formas:
   1) PKCE: ?code=xxxxx na URL (versões mais novas)
   2) Implícito: #access_token=xxxx no hash (versões antigas)
   Sem isso, updateUser() falha porque não sabe qual
   usuário está trocando a senha.
===================================================== */
let sessaoPronta = false;

btnSalvar.disabled = true;
msg.style.color = "#666";
msg.innerText = "Verificando link de redefinição...";

/* Reforço: o Supabase emite esse evento oficial quando processa
   um link de recuperação de senha. Cobre o caso de conexões
   lentas, onde os 300ms da verificação abaixo não seriam suficientes. */
supabaseClient.auth.onAuthStateChange((event, session) => {

    if (event === "PASSWORD_RECOVERY" && session) {

        sessaoPronta = true;
        btnSalvar.disabled = false;
        msg.innerText = "";

    }

});

(async function garantirSessao(){

    try{

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if(code){
            const { error } =
                await supabaseClient.auth.exchangeCodeForSession(code);

            if(error){
                console.error("Erro ao validar código:", error);
            }
        }

        /* Dá um instante pro supabase-js processar o hash
           (#access_token=...), caso o link seja do tipo antigo */
        await new Promise(resolve => setTimeout(resolve, 300));

        const { data } = await supabaseClient.auth.getSession();

        if(data && data.session){

            sessaoPronta = true;
            btnSalvar.disabled = false;
            msg.innerText = "";

        }else{

            msg.style.color = "red";
            msg.innerText =
                "Link inválido ou expirado. Solicite um novo link em 'Esqueceu sua senha?'.";

        }

    }catch(err){

        console.error("Erro ao verificar sessão:", err);

        msg.style.color = "red";
        msg.innerText =
            "Não foi possível validar o link. Solicite um novo.";

    }

})();

btnSalvar.addEventListener("click", async () => {

    if(!sessaoPronta){

        msg.style.color = "red";
        msg.innerText =
            "Link inválido ou expirado. Solicite um novo link em 'Esqueceu sua senha?'.";

        return;

    }

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