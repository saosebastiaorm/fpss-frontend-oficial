/* =====================================================
   FPSS ADMIN MASTER
   ARQUIVO: /js/admin.js
   SEGURANÇA + PAINEL + FILTROS + APROVAÇÃO + LOGOUT
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
const tabela = document.getElementById("tabelaPedidos");
const busca = document.getElementById("busca");
const filtroStatus = document.getElementById("filtroStatus");
const btnAtualizar = document.getElementById("btnAtualizar");

/* =====================================================
   INICIALIZAÇÃO
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {

    const usuario = await verificarAdmin();

    if(!usuario) return;

    criarBotaoLogout(usuario.email);

    carregarPedidos();

});

/* =====================================================
   SEGURANÇA ADMIN
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
   LOGOUT + IDENTIFICAÇÃO
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
   CARREGAR PEDIDOS
===================================================== */
async function carregarPedidos(){

    let query = supabaseClient
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending:false });

    const status = filtroStatus ? filtroStatus.value : "";

    if(status){
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if(error){

        alert("Erro ao carregar pedidos.");
        console.error(error);

        return;

    }

    renderTabela(data || []);
    atualizarResumo(data || []);

}

/* =====================================================
   RENDER TABELA
===================================================== */
function renderTabela(pedidos){

    if(!tabela) return;

    const termo = busca
        ? busca.value.toLowerCase()
        : "";

    const filtrados = pedidos.filter(pedido => {

        const nomeCompleto =
            `${pedido.nome || ""} ${pedido.sobrenome || ""}`
            .toLowerCase();

        const cpf = String(pedido.cpf || "");
        const telefone = String(pedido.telefone || "");

        return (
            nomeCompleto.includes(termo) ||
            cpf.includes(termo) ||
            telefone.includes(termo)
        );

    });

    tabela.innerHTML = "";

    filtrados.forEach(pedido => {

        const tr = document.createElement("tr");

        const status = pedido.status || "PENDING";

        const statusClass =
            status === "APPROVED"
                ? "approved"
                : status === "PENDING"
                    ? "pending"
                    : "cancelled";

        const valorTotal = Number(pedido.valor_total || 0);

        tr.innerHTML = `
            <td>${pedido.order_id || "-"}</td>
            <td>${pedido.nome || ""} ${pedido.sobrenome || ""}</td>
            <td>${pedido.cpf || "-"}</td>
            <td>${pedido.telefone || "-"}</td>
            <td>${pedido.quantidade || 0}</td>
            <td>R$ ${valorTotal.toFixed(2).replace(".", ",")}</td>
            <td>${pedido.horario_retirada || "-"}</td>
            <td class="status ${statusClass}">
                ${status}
            </td>
            <td>
                <button onclick="marcarAprovado('${pedido.order_id}')">
                    Aprovar
                </button>
            </td>
        `;

        tabela.appendChild(tr);

    });

}

/* =====================================================
   RESUMO
===================================================== */
function atualizarResumo(pedidos){

    const totalArrecadado = pedidos
        .filter(p => p.status === "APPROVED")
        .reduce(
            (acc,p) => acc + Number(p.valor_total || 0),
            0
        );

    const totalQtd = pedidos
        .reduce(
            (acc,p) => acc + Number(p.quantidade || 0),
            0
        );

    const elArrecadado =
        document.getElementById("totalArrecadado");

    const elQtd =
        document.getElementById("totalQtd");

    const elPedidos =
        document.getElementById("totalPedidos");

    if(elArrecadado){
        elArrecadado.innerText =
            `R$ ${totalArrecadado
                .toFixed(2)
                .replace(".", ",")}`;
    }

    if(elQtd){
        elQtd.innerText = totalQtd;
    }

    if(elPedidos){
        elPedidos.innerText = pedidos.length;
    }

}

/* =====================================================
   APROVAR PEDIDO
===================================================== */
async function marcarAprovado(orderId){

    const confirmar =
        confirm("Confirmar pedido como APROVADO?");

    if(!confirmar) return;

    const { error } = await supabaseClient
        .from("pedidos")
        .update({
            status:"APPROVED"
        })
        .eq("order_id", orderId);

    if(error){

        alert("Erro ao atualizar status.");
        console.error(error);

        return;

    }

    carregarPedidos();

}

/* =====================================================
   EVENTOS
===================================================== */
if(busca){
    busca.addEventListener(
        "input",
        carregarPedidos
    );
}

if(filtroStatus){
    filtroStatus.addEventListener(
        "change",
        carregarPedidos
    );
}

if(btnAtualizar){
    btnAtualizar.addEventListener(
        "click",
        carregarPedidos
    );
}