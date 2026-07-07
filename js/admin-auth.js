/* =====================================================
   FPSS ADMIN — AUTENTICAÇÃO COMPARTILHADA
   ARQUIVO: /js/admin-auth.js

   Centraliza a lógica de segurança do painel administrativo.
   Deve ser incluído ANTES dos outros scripts admin em cada
   página do painel, logo depois do script do Supabase:

     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="/js/admin-auth.js"></script>
     <script src="/js/produtos.js"></script>   (ou o script da página)

   Fornece:
   - window.fpssAdminAuth.verificarSessao()  -> verifica login e role admin,
       redireciona para /admin/login.html se não estiver autenticado.
       Retorna o token de acesso (string) ou null.
   - window.fpssAdminAuth.getToken()          -> retorna o token já obtido.
   - window.fpssAdminAuth.authHeaders(extra)  -> monta o objeto de headers
       com Authorization: Bearer <token>, pronto pra usar no fetch.
===================================================== */

(function () {

  const SUPABASE_URL = "https://gffmgqvidgswvwnhyife.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ncXZpZGdzd3Z3bmh5aWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDgwMDgsImV4cCI6MjA5MzQyNDAwOH0.YyzDah9VPMjTbOjNJAQbod6NWzIo5v7gCbhlaZ2qVPg";

  // Reaproveita o cliente supabase se já existir na página; senão, cria.
  const client =
    (window.supabaseClient) ||
    (window.supabase && window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));

  let tokenAcesso = null;

  /* Verifica se há sessão válida E se o usuário é admin.
     Se não estiver logado ou não for admin, redireciona para o login
     e retorna null. Se estiver tudo certo, guarda e retorna o token. */
  async function verificarSessao() {
    try {
      const { data: { session }, error: sessionError } =
        await client.auth.getSession();

      if (sessionError || !session) {
        window.location.href = "/admin/login.html";
        return null;
      }

      tokenAcesso = session.access_token;

      const { data: perfil, error } = await client
        .from("user_profiles")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (error || !perfil || perfil.role !== "admin") {
        alert("Acesso não autorizado.");
        await client.auth.signOut();
        window.location.href = "/admin/login.html";
        return null;
      }

      return {
        token: tokenAcesso,
        user: session.user,
        email: session.user.email
      };

    } catch (erro) {
      console.error("ERRO ao verificar sessão admin:", erro);
      window.location.href = "/admin/login.html";
      return null;
    }
  }

  function getToken() {
    return tokenAcesso;
  }

  /* Monta headers com o token. Aceita headers extras (ex: Content-Type). */
  function authHeaders(extra) {
    const base = { "Authorization": `Bearer ${tokenAcesso}` };
    return Object.assign(base, extra || {});
  }

  window.fpssAdminAuth = {
    verificarSessao,
    getToken,
    authHeaders,
    client
  };

})();
