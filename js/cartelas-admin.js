const API_BASE = "https://api.festasaosebastiao.com.br";

let cartelasOriginais = [];
let cartelasFiltradas = [];

/* =========================================
   MOEDA
========================================= */
function moeda(valor) {
  return "R$ " + Number(valor || 0)
    .toFixed(2)
    .replace(".", ",");
}

/* =========================================
   FORMATAR DATA
========================================= */
function formatarData(dataISO) {
  if (!dataISO) return "-";
  try {
    return new Date(dataISO).toLocaleString("pt-BR");
  } catch (e) {
    return dataISO;
  }
}

/* =========================================
   CARREGAR RESUMO (CARDS DO TOPO)
========================================= */
async function carregarResumo() {
  try {

    const res = await fetch(`${API_BASE}/admin/cartelas/resumo`, {
      headers: window.fpssAdminAuth.authHeaders()
    });
    const dados = await res.json();

    if (!dados.sucesso) return;

    document.getElementById("resumoTotal").innerText = dados.total_cartelas;
    document.getElementById("resumoPagas").innerText = dados.total_pagas;
    document.getElementById("resumoPendentes").innerText = dados.total_pendentes;
    document.getElementById("resumoFisicas").innerText = dados.fisicas_pagas;
    document.getElementById("resumoDigitais").innerText = dados.digitais_pagas;
    document.getElementById("resumoPresenca").innerText = dados.confirmaram_presenca;
    document.getElementById("resumoReceita").innerText = moeda(dados.receita_total);

  } catch (e) {
    console.error("Erro ao carregar resumo:", e);
  }
}

/* =========================================
   RENDER TABELA
========================================= */
function renderCartelas(lista) {

  const tabela = document.getElementById("tabelaCartelas");
  tabela.innerHTML = "";

  document.getElementById("contador").innerText =
    `Total exibido: ${lista.length}`;

  if (!lista.length) {
    tabela.innerHTML = `<tr><td colspan="12">Nenhuma cartela encontrada.</td></tr>`;
    return;
  }

  lista.forEach(cartela => {

    tabela.innerHTML += `
      <tr>
        <td>${cartela.id}</td>
        <td>${cartela.numero_chance1 || "-"}</td>
        <td>${cartela.numero_chance2 || "-"}</td>
        <td><span class="selo-tipo ${cartela.tipo}">${cartela.tipo}</span></td>
        <td>${cartela.lote || "-"}</td>
        <td><span class="selo-status ${cartela.status}">${cartela.status}</span></td>
        <td>${cartela.nome_comprador || "-"}</td>
        <td>${cartela.cpf_comprador || "-"}</td>
        <td>${cartela.whatsapp_comprador || "-"}</td>
        <td>${cartela.valor_pago ? moeda(cartela.valor_pago) : "-"}</td>
        <td>${cartela.vai_na_festa === "sim" ? "✅ Sim" : cartela.vai_na_festa === "nao" ? "❌ Não" : "-"}</td>
        <td>${formatarData(cartela.data_pagamento)}</td>
      </tr>
    `;
  });
}

/* =========================================
   CARREGAR (lista completa)
========================================= */
async function carregarCartelas() {

  try {

    document.getElementById("erro").innerHTML = "";

    const res = await fetch(`${API_BASE}/admin/cartelas`, {
      headers: window.fpssAdminAuth.authHeaders()
    });
    const dados = await res.json();

    if (!dados.sucesso) {
      document.getElementById("erro").innerHTML =
        "❌ Erro ao carregar cartelas.";
      return;
    }

    cartelasOriginais = dados.cartelas || [];

    popularFiltroLote();
    filtrarCartelas();
    carregarResumo();

  } catch (e) {

    document.getElementById("erro").innerHTML =
      "❌ Erro de conexão com servidor.";
  }
}

/* =========================================
   POPULAR FILTRO DE LOTE DINAMICAMENTE
========================================= */
function popularFiltroLote() {

  const select = document.getElementById("filtroLote");
  const valorAtual = select.value;

  const lotes = [...new Set(
    cartelasOriginais.map(c => c.lote).filter(Boolean)
  )].sort();

  select.innerHTML =
    '<option value="">Todos</option>' +
    lotes.map(l => `<option value="${l}">${l}</option>`).join("");

  if (lotes.includes(valorAtual)) {
    select.value = valorAtual;
  }
}

/* =========================================
   FILTRO (busca livre + filtros)
========================================= */
function filtrarCartelas() {

  const termo = document.getElementById("busca")
    .value
    .toLowerCase()
    .trim();

  const tipo = document.getElementById("filtroTipo").value;
  const status = document.getElementById("filtroStatus").value;
  const lote = document.getElementById("filtroLote").value;
  const presenca = document.getElementById("filtroPresenca").value;

  const filtradas = cartelasOriginais.filter(c => {

    if (termo) {
      const bate =
        String(c.nome_comprador || "").toLowerCase().includes(termo) ||
        String(c.cpf_comprador || "").toLowerCase().includes(termo) ||
        String(c.numero_chance1 || "").toLowerCase().includes(termo) ||
        String(c.numero_chance2 || "").toLowerCase().includes(termo);

      if (!bate) return false;
    }

    if (tipo && c.tipo !== tipo) return false;
    if (status && c.status !== status) return false;
    if (lote && c.lote !== lote) return false;
    if (presenca && c.vai_na_festa !== presenca) return false;

    return true;
  });

  cartelasFiltradas = filtradas;
  renderCartelas(filtradas);
}

/* =========================================
   LIMPAR FILTROS
========================================= */
function limparFiltros() {

  document.getElementById("busca").value = "";
  document.getElementById("filtroTipo").value = "";
  document.getElementById("filtroStatus").value = "";
  document.getElementById("filtroLote").value = "";
  document.getElementById("filtroPresenca").value = "";

  filtrarCartelas();
}

/* =========================================
   BUSCA RÁPIDA — CONFERÊNCIA DO SORTEIO
   (busca direto no backend pelo número, igual no dia
   do sorteio: digita o número sorteado e vê quem pagou)
========================================= */
async function buscarCartelaRapida() {

  const numero = document.getElementById("buscaRapidaNumero").value.trim();
  const resultado = document.getElementById("resultadoBuscaRapida");

  if (!numero) {
    resultado.innerHTML = "";
    return;
  }

  resultado.innerHTML = `<p style="color:#5b6b7c;">Buscando...</p>`;

  try {

    const res = await fetch(`${API_BASE}/admin/cartelas/buscar/${encodeURIComponent(numero)}`, {
      headers: window.fpssAdminAuth.authHeaders()
    });
    const dados = await res.json();

    if (!dados.sucesso || !dados.cartela) {
      resultado.innerHTML = `
        <div class="erro" style="display:block;">
          ❌ Cartela não encontrada para o número "${numero}".
        </div>
      `;
      return;
    }

    const c = dados.cartela;

    resultado.innerHTML = `
      <div class="card" style="border-left:5px solid ${c.status === 'pago' ? '#16a34a' : '#d97706'};">
        <h3 style="margin-top:0;">
          ${c.status === 'pago' ? '✅ Cartela PAGA' : '⚠️ Cartela ' + c.status.toUpperCase()}
        </h3>
        <div class="linha"><strong>Número (chance 1):</strong> ${c.numero_chance1 || "-"}</div>
        <div class="linha"><strong>Número (chance 2):</strong> ${c.numero_chance2 || "-"}</div>
        <div class="linha"><strong>Tipo:</strong> ${c.tipo}</div>
        <div class="linha"><strong>Nome do comprador:</strong> ${c.nome_comprador || "-"}</div>
        <div class="linha"><strong>CPF:</strong> ${c.cpf_comprador || "-"}</div>
        <div class="linha"><strong>WhatsApp:</strong> ${c.whatsapp_comprador || "-"}</div>
        <div class="linha"><strong>Data do pagamento:</strong> ${formatarData(c.data_pagamento)}</div>
        <div class="linha"><strong>Comprovante:</strong> ${c.comprovante_id || "-"}</div>
      </div>
    `;

  } catch (e) {

    resultado.innerHTML = `
      <div class="erro" style="display:block;">
        ❌ Erro de conexão ao buscar cartela.
      </div>
    `;
  }
}

/* =========================================
   EXPORTAR CSV
========================================= */
function exportarCSV() {

  if (!cartelasFiltradas || !cartelasFiltradas.length) {
    alert("❌ Nenhuma cartela para exportar (verifique os filtros aplicados).");
    return;
  }

  const cabecalho = [
    "ID",
    "Número Chance 1",
    "Número Chance 2",
    "Tipo",
    "Lote",
    "Status",
    "Nome",
    "CPF",
    "WhatsApp",
    "Valor Pago",
    "Vai à Festa",
    "Data Pagamento",
    "Comprovante"
  ];

  const linhas = cartelasFiltradas.map(c => [
    c.id || "",
    c.numero_chance1 || "",
    c.numero_chance2 || "",
    c.tipo || "",
    c.lote || "",
    c.status || "",
    c.nome_comprador || "",
    c.cpf_comprador || "",
    c.whatsapp_comprador || "",
    c.valor_pago || "",
    c.vai_na_festa || "",
    c.data_pagamento || "",
    c.comprovante_id || ""
  ]);

  let csvConteudo = "";
  csvConteudo += cabecalho.join(";") + "\n";

  linhas.forEach(linha => {
    const linhaSegura = linha.map(valor =>
      `"${String(valor).replace(/"/g, '""')}"`
    );
    csvConteudo += linhaSegura.join(";") + "\n";
  });

  const blob = new Blob(
    ["\uFEFF" + csvConteudo],
    { type: "text/csv;charset=utf-8;" }
  );

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const data = new Date();

  const nomeArquivo =
    `cartelas-fpss-${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,"0")}-${String(data.getDate()).padStart(2,"0")}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", nomeArquivo);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================================
   START
========================================= */
/* Verifica se é admin logado ANTES de carregar os dados.
   Se não estiver autenticado, admin-auth.js redireciona para o login. */
document.addEventListener("DOMContentLoaded", async () => {
  const sessao = await window.fpssAdminAuth.verificarSessao();
  if (!sessao) return; // redirecionado para login
  carregarCartelas();
});
