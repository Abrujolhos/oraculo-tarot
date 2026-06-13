import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPA_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    persistSession: true,        // sessão guardada no localStorage — não perde o login
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
