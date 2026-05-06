import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co') {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Supabase credentials missing or using placeholders. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets or .env file.'
  );
}

export const supabase = client as SupabaseClient;
