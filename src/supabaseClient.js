// Cliente Supabase simplificado — fetch direto, sem SDK
// As chaves anon são públicas por design (destinam-se ao frontend)

export const SUPABASE_URL = "https://ditjofmxqjcgtmwghhdb.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdGpvZm14cWpjZ3Rtd2doaGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzEyOTMsImV4cCI6MjA5Njc0NzI5M30.DfxKE7Qad1J0ADYMoKvutkYSi6y90kR8nxq3_yMjlSw";

function cabecalhos(token) {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

// Sessão guardada no localStorage (persistência entre visitas)
const SESS_KEY = "oraculo_sessao";

function guardarSessao(sessao) {
  try { localStorage.setItem(SESS_KEY, JSON.stringify(sessao)); } catch {}
}

function lerSessao() {
  try { return JSON.parse(localStorage.getItem(SESS_KEY) || "null"); } catch { return null; }
}

function apagarSessao() {
  try { localStorage.removeItem(SESS_KEY); } catch {}
}

export const supabase = {
  // Auth
  auth: {
    async signUp({ email, password, options }) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: cabecalhos(),
        body: JSON.stringify({ email, password, data: options?.data || {} }),
      });
      const d = await r.json();
      if (!r.ok) return { data: null, error: { message: d.msg || d.error_description || "Erro no registo" } };
      if (d.access_token) guardarSessao({ token: d.access_token, user: d.user });
      return { data: { session: d.access_token ? { access_token: d.access_token, user: d.user } : null, user: d.user }, error: null };
    },

    async signInWithPassword({ email, password }) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: cabecalhos(),
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) return { data: null, error: { message: d.error_description || d.msg || "Credenciais inválidas" } };
      const sessao = { token: d.access_token, user: d.user };
      guardarSessao(sessao);
      return { data: { session: { access_token: d.access_token, user: d.user } }, error: null };
    },

    async getSession() {
      const sessao = lerSessao();
      if (!sessao) return { data: { session: null } };
      // Verificar se o token ainda é válido
      try {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: cabecalhos(sessao.token),
        });
        if (!r.ok) { apagarSessao(); return { data: { session: null } }; }
        return { data: { session: { access_token: sessao.token, user: sessao.user } } };
      } catch { return { data: { session: null } }; }
    },

    async signOut() {
      apagarSessao();
      return { error: null };
    },

    onAuthStateChange(callback) {
      // Sem WebSocket — devolve subscription vazia (sem-ops)
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },

  // BD — retorna interface compatível com o que o App.js espera
  from(tabela) {
    const _tabela = tabela;
    let _filtros = [];
    let _select = "*";
    let _order = null;
    let _limit = null;
    let _single = false;

    const obj = {
      select(cols = "*") { _select = cols; return obj; },
      eq(col, val) { _filtros.push(`${col}=eq.${val}`); return obj; },
      gte(col, val) { _filtros.push(`${col}=gte.${encodeURIComponent(val)}`); return obj; },
      order(col, { ascending = true } = {}) { _order = `${col}.${ascending ? "asc" : "desc"}`; return obj; },
      limit(n) { _limit = n; return obj; },
      single() { _single = true; return obj; },

      async _url(token) {
        let url = `${SUPABASE_URL}/rest/v1/${_tabela}?select=${_select}`;
        for (const f of _filtros) url += `&${f}`;
        if (_order) url += `&order=${_order}`;
        if (_limit) url += `&limit=${_limit}`;
        return url;
      },

      async then() { return obj; }, // placeholder

      async _exec(token, method = "GET", body = null) {
        const url = await obj._url(token);
        const opts = { method, headers: cabecalhos(token) };
        if (body) opts.body = JSON.stringify(body);
        if (method === "POST") opts.headers["Prefer"] = "return=representation";
        if (method === "POST" && _tabela === "analises_mensais") opts.headers["Prefer"] = "resolution=merge-duplicates";
        if (method === "POST" && _tabela === "consentimentos") opts.headers["Prefer"] = "resolution=merge-duplicates";
        const r = await fetch(url, opts);
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          return { data: null, error: { message: err.message || `HTTP ${r.status}` } };
        }
        if (method === "DELETE" || method === "PATCH") return { data: null, error: null };
        const data = await r.json();
        if (_single) return { data: Array.isArray(data) ? data[0] || null : data, error: null };
        return { data, error: null };
      },
    };

    return obj;
  },

  // Edge Functions
  functions: {
    async invoke(nome, { body } = {}) {
      const sessao = lerSessao();
      const r = await fetch(`${SUPABASE_URL}/functions/v1/${nome}`, {
        method: "POST",
        headers: cabecalhos(sessao?.token),
        body: JSON.stringify(body || {}),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return { data: null, error: { message: data?.error || `HTTP ${r.status}`, context: data } };
      return { data, error: null };
    },
  },
};

export default supabase;
