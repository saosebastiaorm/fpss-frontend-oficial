const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbzc4p873RcAhbAegYAC1Wc1esCyhKsI8pNPhvfCYavGPBAHES3ppfeduiKdVE08IUd_/exec";

document.addEventListener("DOMContentLoaded", function(){

  const form = document.getElementById("formDoacao");
  const msg = document.getElementById("msg");
  const tipo = document.getElementById("tipoDoacao");
  const campoComprovante = document.getElementById("campoComprovante");
  const inputFile = document.getElementById("comprovante");

  if(!form) return;

  /* =========================
     MOSTRAR COMPROVANTE
  ========================= */
  tipo.addEventListener("change", function(){

    if(this.value === "Dinheiro"){
      campoComprovante.style.display = "block";
    }else{
      campoComprovante.style.display = "none";
    }

  });

  /* =========================
     SUBMIT
  ========================= */
  form.addEventListener("submit", async function(e){

    e.preventDefault();

    msg.style.color = "#333";
    msg.innerHTML = "⏳ Enviando...";

    const dados = new FormData(form);

    dados.append("origem", "DOACAO");

    try{

      /* COMPROVANTE */
      if(inputFile.files.length > 0){

        const file = inputFile.files[0];
        const base64 = await toBase64(file);

        dados.append("arquivo", base64);
        dados.append("nome_arquivo", file.name);

      }

      await fetch(URL_SCRIPT,{
        method:"POST",
        body:dados
      });

      msg.style.color = "green";
      msg.innerHTML = "✅ Doação enviada com sucesso!";

      form.reset();
      campoComprovante.style.display = "none";

    }catch(err){

      console.error(err);

      msg.style.color = "red";
      msg.innerHTML = "❌ Erro ao enviar doação.";

    }

  });

});

/* =========================
   BASE64
========================= */
function toBase64(file){

  return new Promise((resolve,reject)=>{

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = error => reject(error);

  });

}