import { createClient } from '@supabase/supabase-js';

// Self-hosted Supabase Configuration
const supabaseUrl = 'https://supabase.shopmarkets.app';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NzM5OTMwMCwiZXhwIjo0OTIzMDcyOTAwLCJyb2xlIjoiYW5vbiJ9.N2M2vitcpgGAea69OXipNpZ1Zh4grCWG0ygSdroVK4g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;
