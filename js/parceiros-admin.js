/* =====================================================
   FPSS ADMIN — PARCEIROS
   ARQUIVO: /js/parceiros-admin.js
===================================================== */

/* =====================================================
   CONFIG SUPABASE
===================================================== */
const SUPABASE_URL = "https://gffmgqvidgswvwnhyife.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* =====================================================
   ELEMENTOS
===================================================== */
const tabelaParceiros = document.getElementById("tabelaParceiros");

/* =====================================================
   INICIALIZAÇÃO
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {

    const usuario = await verificarAdmin();

    if(!usuario) return;

    criarBotaoLogout(usuario.email);

    carregarParceiros();

});

/* =====================================================
   SEGURANÇA ADMIN (mesmo padrão usado no resto do painel)
===================================================== */
async function verificarAdmin(){

    try{

        const { data: { session }, error: sessionError } =
            await supabaseClient.auth.getSession();

        if(sessionError || !session){

            window.location.href = "login.html";
            return null;

        }

        const user = session.user;

        const { data: perfil, error } = await supabaseClient
            .from("user_profiles")
            .select("role,nome,email")
            .eq("email", user.email)
            .single();

        if(error || !perfil || perfil.role !== "admin"){

            alert("Acesso não autorizado.");

            await supabaseClient.auth.signOut();

            window.location.href = "login.html";

            return null;

        }

        return perfil;

    }catch(err){

        console.error("Erro segurança:", err);

        window.location.href = "login.html";

        return null;

    }

}

/* =====================================================
   LOGOUT
===================================================== */
function criarBotaoLogout(email){

    const topo = document.createElement("div");

    topo.style.display = "flex";
    topo.style.justifyContent = "space-between";
    topo.style.alignItems = "center";
    topo.style.marginBottom = "20px";
    topo.style.padding = "10px";
    topo.style.background = "#fff3f3";
    topo.style.border = "2px solid #8b1111";
    topo.style.borderRadius = "12px";

    topo.innerHTML = `
        <div style="font-weight:bold;color:#8b1111;">
            🔐 Admin: ${email}
        </div>

        <button id="btnLogout"
            style="
                background:#8b1111;
                color:white;
                border:none;
                padding:10px 18px;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
            ">
            SAIR
        </button>
    `;

    document.body.insertBefore(topo, document.body.firstChild);

    document
        .getElementById("btnLogout")
        .addEventListener("click", logoutAdmin);

}

async function logoutAdmin(){

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

}

/* =====================================================
   CARREGAR PARCEIROS (sempre busca do banco de novo —
   nunca edita a tabela "na mão" no navegador, pra não
   correr o risco de duplicar/desincronizar linhas)
===================================================== */
async function carregarParceiros(){

    const { data, error } = await supabaseClient
        .from("parceiros")
        .select("*")
        .order("ordem", { ascending: true });

    if(error){

        alert("Erro ao carregar parceiros.");
        console.error(error);

        return;

    }

    renderTabelaParceiros(data || []);

}

/* =====================================================
   RENDER TABELA
===================================================== */
function renderTabelaParceiros(parceiros){

    if(!tabelaParceiros) return;

    if(parceiros.length === 0){

        tabelaParceiros.innerHTML =
            `<tr><td colspan="6">Nenhum parceiro cadastrado ainda.</td></tr>`;

        return;

    }

    tabelaParceiros.innerHTML = parceiros.map(p => `
        <tr>
            <td><img src="${escapeAttr(p.logo_url)}" alt="${escapeAttr(p.nome)}"></td>
            <td>${escapeHtml(p.nome)}</td>
            <td><span class="selo-cota ${p.cota}">${p.cota}</span></td>
            <td>${p.ativo ? "Ativo" : "Inativo"}</td>
            <td>${p.ordem}</td>
            <td>
                <button onclick="editarParceiro('${p.id}')">✏️ Editar</button>
                <button onclick="excluirParceiro('${p.id}')">🗑️ Excluir</button>
            </td>
        </tr>
    `).join("");

}

function escapeHtml(texto){
    return String(texto ?? "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;");
}
function escapeAttr(texto){
    return String(texto ?? "").replace(/"/g,"&quot;");
}

/* =====================================================
   NOVO PARCEIRO (limpa o formulário)
===================================================== */
function novoParceiro(){

    document.getElementById("parceiroId").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("cota").value = "bronze";
    document.getElementById("link").value = "";
    document.getElementById("ordem").value = "0";
    document.getElementById("ativo").value = "true";
    document.getElementById("logoUrl").value = "";
    document.getElementById("statusUploadLogo").innerText = "";

}

/* =====================================================
   EDITAR PARCEIRO (busca o registro específico pelo id —
   nunca pelo índice da lista na tela, pra evitar editar/
   excluir a linha errada se a ordem mudar)
===================================================== */
async function editarParceiro(id){

    const btnSalvarEl = document.querySelector('button[onclick="salvarParceiro()"]');
    if(btnSalvarEl) btnSalvarEl.disabled = true;

    const { data, error } = await supabaseClient
        .from("parceiros")
        .select("*")
        .eq("id", id)
        .single();

    if(error || !data){

        alert("Não foi possível carregar este parceiro.");
        console.error(error);
        if(btnSalvarEl) btnSalvarEl.disabled = false;

        return;

    }

    document.getElementById("parceiroId").value = data.id;
    document.getElementById("nome").value = data.nome || "";
    document.getElementById("cota").value = data.cota || "bronze";
    document.getElementById("link").value = data.link || "";
    document.getElementById("ordem").value = data.ordem ?? 0;
    document.getElementById("ativo").value = String(!!data.ativo);
    document.getElementById("logoUrl").value = data.logo_url || "";

    if(btnSalvarEl) btnSalvarEl.disabled = false;

    window.scrollTo({ top: 0, behavior: "smooth" });

}

/* =====================================================
   SALVAR (cria se não tem id, atualiza se já tem)
===================================================== */
async function salvarParceiro(){

    const id      = document.getElementById("parceiroId").value;
    const nome    = document.getElementById("nome").value.trim();
    const cota    = document.getElementById("cota").value;
    const link    = document.getElementById("link").value.trim();
    const ordem   = parseInt(document.getElementById("ordem").value, 10) || 0;
    const ativo   = document.getElementById("ativo").value === "true";
    const logoUrl = document.getElementById("logoUrl").value.trim();

    if(!logoUrl){
        alert("Envie a logo do parceiro antes de salvar.");
        return;
    }

    const payload = {
        nome: nome || "Parceiro",
        cota,
        link: link || null,
        ordem,
        ativo,
        logo_url: logoUrl
    };

    let resultado;

    if(id){

        resultado = await supabaseClient
            .from("parceiros")
            .update(payload)
            .eq("id", id);

    }else{

        resultado = await supabaseClient
            .from("parceiros")
            .insert(payload);

    }

    if(resultado.error){

        alert("Erro ao salvar parceiro: " + resultado.error.message);
        console.error(resultado.error);

        return;

    }

    novoParceiro();
    carregarParceiros();

}

/* =====================================================
   EXCLUIR — sempre por id específico (.eq("id", id)) e
   sempre recarrega a lista DO BANCO depois, em vez de
   remover a linha na mão na tela. Isso evita o tipo de
   bug onde excluir um item "duplicava" outro na lista.
===================================================== */
async function excluirParceiro(id){

    if(!confirm("Excluir este parceiro? Essa ação não pode ser desfeita.")){
        return;
    }

    const { error } = await supabaseClient
        .from("parceiros")
        .delete()
        .eq("id", id);

    if(error){

        alert("Erro ao excluir parceiro: " + error.message);
        console.error(error);

        return;

    }

    carregarParceiros();

}

/* =====================================================
   UPLOAD DE LOGO PRO SUPABASE STORAGE
===================================================== */
async function uploadLogoParceiro(){

    const input = document.getElementById("logoArquivo");
    const status = document.getElementById("statusUploadLogo");

    if(!input.files || input.files.length === 0){
        status.style.color = "red";
        status.innerText = "Escolha um arquivo de imagem primeiro.";
        return;
    }

    const arquivo = input.files[0];
    const extensao = arquivo.name.split(".").pop();
    const nomeArquivo =
        "parceiro-" + Date.now() + "-" +
        Math.random().toString(36).slice(2,8) +
        "." + extensao;

    status.style.color = "#666";
    status.innerText = "Enviando...";

    const { error: erroUpload } = await supabaseClient
        .storage
        .from("parceiros")
        .upload(nomeArquivo, arquivo, {
            cacheControl: "3600",
            upsert: false
        });

    if(erroUpload){

        status.style.color = "red";
        status.innerText = "Erro no upload: " + erroUpload.message;
        console.error(erroUpload);

        return;

    }

    const { data: urlData } = supabaseClient
        .storage
        .from("parceiros")
        .getPublicUrl(nomeArquivo);

    document.getElementById("logoUrl").value = urlData.publicUrl;

    status.style.color = "green";
    status.innerText = "Logo enviada com sucesso!";

}
