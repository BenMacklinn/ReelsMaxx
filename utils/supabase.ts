import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase Env Vars Missing!');
  console.error('URL:', supabaseUrl);
  console.error('Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) : 'undefined');
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase Client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);
