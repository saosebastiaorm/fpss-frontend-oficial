const API = "https://api.festasaosebastiao.com.br";

async function carregarProdutos(){
  try{
    const res = await fetch(`${API}/admin/produtos`);
    const texto = await res.text();

    let data;

    try{
      data = JSON.parse(texto);
    }catch{
      alert("❌ Backend retornou erro inesperado.");
      return;
    }

    const tabela = document.getElementById("tabelaProdutos");

    if(!data.sucesso || !data.produtos.length){
      tabela.innerHTML = `<tr><td colspan="9">Nenhum produto encontrado.</td></tr>`;
      return;
    }

    tabela.innerHTML = data.produtos.map(produto => `
      <tr>
        <td>${produto.codigo}</td>

        <td>
          <img
            src="${produto.imagem || 'https://via.placeholder.com/60x60?text=Sem+Imagem'}"
            alt="${produto.nome}"
            style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #ccc;"
          >
        </td>

        <td>${produto.nome}</td>

        <td>R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}</td>

        <td>${produto.estoque}</td>

        <td>${produto.tipo}</td>

        <td>
          <span class="status ${produto.ativo ? "ativo" : "inativo"}">
            ${produto.ativo ? "Ativo" : "Inativo"}
          </span>
        </td>

        <td>${produto.ordem}</td>

        <td>
          <button
            class="btn-editar"
            onclick='editarProduto(${JSON.stringify(produto)})'
          >
            ✏️ Editar
          </button>
          <button
            class="btn-excluir"
            onclick="excluirProduto('${produto.id}')"
          >
            🗑️ Excluir
          </button>
        </td>
      </tr>
    `).join("");

  }catch{
    document.getElementById("tabelaProdutos").innerHTML =
      `<tr><td colspan="9">Erro ao carregar.</td></tr>`;
  }
}

function editarProduto(produto){
  document.getElementById("produtoId").value = produto.id || "";
  document.getElementById("codigo").value = produto.codigo || "";
  document.getElementById("nome").value = produto.nome || "";
  document.getElementById("preco").value = produto.preco || "";
  document.getElementById("estoque").value = produto.estoque || "";
  document.getElementById("tipo").value = produto.tipo || "produto";
  document.getElementById("ordem").value = produto.ordem || "";
  document.getElementById("ativo").value = String(produto.ativo);
  document.getElementById("imagem").value = produto.imagem || "";
  document.getElementById("descricao").value = produto.descricao || "";

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function novoProduto(){
  document.getElementById("produtoId").value = "";
  document.getElementById("codigo").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("estoque").value = "";
  document.getElementById("tipo").value = "produto";
  document.getElementById("ordem").value = "";
  document.getElementById("ativo").value = "true";
  document.getElementById("imagem").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("imagemArquivo").value = "";
  document.getElementById("nomeArquivo").value = "";
  document.getElementById("statusUploadImagem").innerText = "";
}

async function uploadImagemProduto(){

  const arquivoInput = document.getElementById("imagemArquivo");
  const nomeArquivo = document.getElementById("nomeArquivo").value.trim();
  const status = document.getElementById("statusUploadImagem");

  if(!arquivoInput.files.length){
    alert("❌ Selecione uma imagem.");
    return;
  }

  const arquivo = arquivoInput.files[0];

  const formData = new FormData();
  formData.append("imagem", arquivo);
  formData.append("nomeArquivo", nomeArquivo || `produto-${Date.now()}`);

  status.innerText = "Enviando imagem...";

  try{

    const res = await fetch(`${API}/admin/upload-imagem`, {
      method:"POST",
      body:formData
    });

    const data = await res.json();

    if(!res.ok || !data.sucesso){
      alert("❌ " + (data.erro || "Erro upload."));
      status.innerText = "";
      return;
    }

    document.getElementById("imagem").value = data.imagem_url;

    status.innerText = "✅ Imagem enviada com sucesso!";

    alert("✅ Upload concluído!");

  }catch(erro){

    console.error("ERRO UPLOAD:", erro);

    status.innerText = "";

    alert("❌ Erro ao enviar imagem.");
  }
}

async function excluirProduto(id){

  if(!confirm("Excluir este produto? Essa ação não pode ser desfeita.")){
    return;
  }

  try{

    const res = await fetch(`${API}/admin/produtos/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if(!res.ok || !data.sucesso){
      alert("❌ " + (data.erro || "Erro ao excluir produto."));
      return;
    }

    carregarProdutos();

  }catch(erro){

    console.error("ERRO EXCLUIR PRODUTO:", erro);
    alert("❌ Erro de conexão ao excluir.");

  }

}

async function salvarProduto(){

  const produto = {
    id: document.getElementById("produtoId").value || undefined,
    codigo: document.getElementById("codigo").value.trim().toUpperCase(),
    nome: document.getElementById("nome").value.trim(),
    preco: Number(document.getElementById("preco").value),
    estoque: Number(document.getElementById("estoque").value),
    tipo: document.getElementById("tipo").value,
    ordem: Number(document.getElementById("ordem").value),
    ativo: document.getElementById("ativo").value === "true",
    imagem: document.getElementById("imagem").value.trim(),
    descricao: document.getElementById("descricao").value.trim()
  };

  if(!produto.codigo || !produto.nome){
    alert("❌ Código e nome são obrigatórios.");
    return;
  }

  try{

    const res = await fetch(`${API}/admin/produtos`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(produto)
    });

    const texto = await res.text();

    let data;

    try{
      data = JSON.parse(texto);
    }catch{
      alert("❌ Backend retornou erro inesperado.");
      return;
    }

    if(!res.ok || !data.sucesso){
      alert("❌ " + (data.erro || "Erro ao salvar."));
      return;
    }

    alert("✅ Produto salvo com sucesso!");

    novoProduto();
    carregarProdutos();

  }catch(e){
    console.error("ERRO PRODUTO:", e);
    alert("❌ Erro de conexão.");
  }
}

carregarProdutos();