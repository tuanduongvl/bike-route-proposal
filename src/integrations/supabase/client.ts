import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nbhovatjpzmtmrmlybqg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaG92YXRqcHptdG1ybWx5YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNjE2NzIsImV4cCI6MjA0OTkzNzY3Mn0.oZqItarNkNcFz62JbGnW2spZJjwHIYMGAltvRn12h3U";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }
  }
);