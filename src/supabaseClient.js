import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente com fallback hardcoded (chaves públicas — seguro no frontend)
const SUPA_URL = process.env.REACT_APP_SUPABASE_URL 
  || "https://ditjofmxqjcgtmwghhdb.supabase.co";
const SUPA_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY 
  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdGpvZm14cWpjZ3Rtd2doaGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzEyOTMsImV4cCI6MjA5Njc0NzI5M30.DfxKE7Qad1J0ADYMoKvutkYSi6y90kR8nxq3_yMjlSw";

export const SUPABASE_URL = SUPA_URL;
export const SUPABASE_ANON_KEY = SUPA_KEY;

export const supabase = createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
