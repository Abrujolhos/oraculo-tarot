# Oráculo — Tarot com IA

App de tarot profissional com IA, trilingue (PT-PT, PT-BR, EN), com planos Free e Pro.

## Stack
- React + supabase-js (auth com sessão persistente, BD, Edge Functions)
- Supabase (auth, postgres, edge functions com OpenRouter)
- Vercel (hosting, deploy automático a cada push)
- PWA instalável no telemóvel

## Variáveis de ambiente (Vercel → Settings → Environment Variables)
```
REACT_APP_SUPABASE_URL=https://ditjofmxqjcgtmwghhdb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<chave anon do supabase>
REACT_APP_STRIPE_MENSAL=<link stripe mensal>
REACT_APP_STRIPE_ANUAL=<link stripe anual>
```

## Deploy
Push para `main` → deploy automático no Vercel (~2 min).
