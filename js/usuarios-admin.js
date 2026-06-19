/* =====================================================
   FPSS ADMIN - USUÁRIOS
   ARQUIVO: /js/usuarios-admin.js
===================================================== */

const SUPABASE_URL = "https://gffmgqvidgswvwnhyife.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const API_BASE = "https://api.festasaosebastiao.com.br";

let usuarioLogadoId = null;
let tokenAcesso = null;
let usuariosCache = [];

/* =====================================================
   INICIALIZAÇÃO
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {

    const usuario = await verificarAdmin();

    if (!usuario) return;

    criarBotaoLogout(usuario.email);

    carregarUsuarios();

});

/* =====================================================
   SEGURANÇA ADMIN (mesmo padrão das outras páginas)
===================================================== */
async function verificarAdmin() {

    try {

        const { data: { session }, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError || !session) {
            window.location.href = "/admin/login.html";
            return null;
        }

        const user = session.user;
        tokenAcesso = session.access_token;
        usuarioLogadoId = user.id;

        const { data: perfil, error } = await supabaseClient
            .from("user_profiles")
            .select("role,nome,email")
            .eq("email", user.email)
            .single();

        if (error || !perfil || perfil.role !== "admin") {

            alert("Acesso não autorizado.");

            await supabaseClient.auth.signOut();

            window.location.href = "/admin/login.html";

            return null;

        }

        return perfil;

    } catch (err) {

        console.error("Erro segurança:", err);

        window.location.href = "/admin/login.html";

        return null;

    }

}

/* =====================================================
   LOGOUT
===================================================== */
function criarBotaoLogout(email) {

    const topo = document.createElement("div");

    topo.style.display = "flex";
    topo.style.justifyContent = "space-between";
    topo.style.alignItems = "center";
    topo.style.marginBottom = "16px";
    topo.style.padding = "10px 14px";
    topo.style.background = "#fff3f3";
    topo.style.border = "1px solid #e3b8b8";
    topo.style.borderRadius = "10px";

    topo.innerHTML = `
        <div style="font-weight:bold;color:#8b0000;font-size:13px;">
            🔐 Admin: ${email}
        </div>
        <button id="btnLogout">SAIR</button>
    `;

    document.body.insertBefore(topo, document.body.firstChild);

    document
        .getElementById("btnLogout")
        .addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            window.location.href = "/admin/login.html";
        });

}

/* =====================================================
   CABEÇALHO DE AUTORIZAÇÃO PRO BACKEND
===================================================== */
function headersComToken() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenAcesso}`
    };
}

/* =====================================================
   LISTAR USUÁRIOS
===================================================== */
async function carregarUsuarios() {

    const tabela = document.getElementById("tabelaUsuarios");
    const erroDiv = document.getElementById("erro");

    erroDiv.innerText = "";

    try {

        const res = await fetch(`${API_BASE}/admin/usuarios`, {
            headers: headersComToken()
        });

        const dados = await res.json();

        if (!dados.sucesso) {
            erroDiv.innerText = "❌ " + (dados.erro || "Erro ao carregar usuários.");
            return;
        }

        tabela.innerHTML = "";

        usuariosCache = dados.usuarios;

        dados.usuarios.forEach(usuario => {

            const dataCriacao = usuario.created_at
                ? new Date(usuario.created_at).toLocaleDateString("pt-BR")
                : "-";

            const perfilLabel = usuario.role === "admin"
                ? "Administrador"
                : "Padrão";

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${usuario.nome || "-"}</td>
                <td>${usuario.email || "-"}</td>
                <td>${perfilLabel}</td>
                <td>${dataCriacao}</td>
                <td>
                    <button class="btn-editar" onclick="editarUsuario('${usuario.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn-excluir" onclick="excluirUsuario('${usuario.id}')">
                        🗑️ Excluir
                    </button>
                </td>
            `;

            tabela.appendChild(linha);

        });

    } catch (erro) {

        console.error("ERRO CARREGAR USUARIOS:", erro);
        erroDiv.innerText = "❌ Erro de conexão ao carregar usuários.";

    }

}

/* =====================================================
   FORMULÁRIO — NOVO USUÁRIO
===================================================== */
function novoUsuario() {

    document.getElementById("usuarioId").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("papel").value = "admin";

    document.getElementById("formTitulo").innerText = "Novo Usuário";
    document.getElementById("campoEmail").style.display = "block";
    document.getElementById("campoSenha").style.display = "block";

    document.getElementById("formCard").style.display = "block";

}

/* =====================================================
   FORMULÁRIO — EDITAR USUÁRIO EXISTENTE
   (e-mail e senha não são editáveis aqui — só nome e papel)
===================================================== */
function editarUsuario(id) {

    const usuario = usuariosCache.find(u => u.id === id);

    if (!usuario) {
        alert("Usuário não encontrado. Atualize a página e tente novamente.");
        return;
    }

    document.getElementById("usuarioId").value = usuario.id;
    document.getElementById("nome").value = usuario.nome || "";
    document.getElementById("email").value = usuario.email || "";
    document.getElementById("senha").value = "";
    document.getElementById("papel").value = usuario.role === "admin" ? "admin" : "padrao";

    document.getElementById("formTitulo").innerText = "Editar Usuário";
    document.getElementById("campoEmail").style.display = "none";
    document.getElementById("campoSenha").style.display = "none";

    document.getElementById("formCard").style.display = "block";
    document.getElementById("formCard").scrollIntoView({ behavior: "smooth", block: "start" });

}

function cancelarFormulario() {
    document.getElementById("formCard").style.display = "none";
}

/* =====================================================
   SALVAR — DECIDE ENTRE CRIAR (POST) OU EDITAR (PUT)
===================================================== */
async function salvarUsuario() {

    const id = document.getElementById("usuarioId").value;
    const nome = document.getElementById("nome").value.trim();
    const papel = document.getElementById("papel").value;

    const erroDiv = document.getElementById("erro");
    erroDiv.innerText = "";

    if (!nome) {
        erroDiv.innerText = "❌ Preencha o nome.";
        return;
    }

    try {

        let res;

        if (id) {

            /* MODO EDIÇÃO */
            res = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
                method: "PUT",
                headers: headersComToken(),
                body: JSON.stringify({ nome, role: papel })
            });

        } else {

            /* MODO CRIAÇÃO */
            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;

            if (!email || !senha) {
                erroDiv.innerText = "❌ Preencha e-mail e senha.";
                return;
            }

            if (senha.length < 6) {
                erroDiv.innerText = "❌ A senha precisa ter pelo menos 6 caracteres.";
                return;
            }

            res = await fetch(`${API_BASE}/admin/usuarios`, {
                method: "POST",
                headers: headersComToken(),
                body: JSON.stringify({ nome, email, password: senha, role: papel })
            });

        }

        const dados = await res.json();

        if (!dados.sucesso) {
            erroDiv.innerText = "❌ " + (dados.erro || "Erro ao salvar usuário.");
            return;
        }

        cancelarFormulario();
        carregarUsuarios();

    } catch (erro) {

        console.error("ERRO SALVAR USUARIO:", erro);
        erroDiv.innerText = "❌ Erro de conexão ao salvar usuário.";

    }

}

/* =====================================================
   EXCLUIR USUÁRIO
===================================================== */
async function excluirUsuario(id) {

    if (id === usuarioLogadoId) {
        alert("Você não pode excluir o seu próprio usuário.");
        return;
    }

    if (!confirm("Excluir este usuário? Essa ação não pode ser desfeita.")) {
        return;
    }

    try {

        const res = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
            method: "DELETE",
            headers: headersComToken()
        });

        const dados = await res.json();

        if (!dados.sucesso) {
            alert("❌ " + (dados.erro || "Erro ao excluir usuário."));
            return;
        }

        carregarUsuarios();

    } catch (erro) {

        console.error("ERRO EXCLUIR USUARIO:", erro);
        alert("❌ Erro de conexão ao excluir usuário.");

    }

}
