/* =====================================================
   FPSS 2027 • CONFIG.JS OFICIAL DE PRODUÇÃO BLINDADO
   Suporte a ES6 Modules, Supabase, Render e Anti-Duplicação
===================================================== */

// Criamos a configuração diretamente no escopo global da janela (window)
// Isso evita 100% o erro "Identifier already been declared" do const/let
window.FPSS_CONFIG = {
    SUPABASE_URL: "https://gffmgqvidgswvwnhyife.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg",
    BACKEND_URL: "https://fpss-backend.onrender.com"
};

// Criamos um atalho global para scripts que procuram a variável solta na memória
var FPSS_CONFIG = window.FPSS_CONFIG;

console.log("✔ FPSS_CONFIG de produção injetado com sucesso no ecossistema Render/Supabase.");