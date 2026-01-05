import { createClient } from '@supabase/supabase-js';

// Self-hosted Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Fallback to dummy values if not configured, to prevent app crash on startup
// since we are moving to custom authService.
const url = supabaseUrl || 'https://placeholder.url';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;
