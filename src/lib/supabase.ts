import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nbhovatjpzmtmrmlybqg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaG92YXRqcHptdG1ybWx5YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNjE2NzIsImV4cCI6MjA0OTkzNzY3Mn0.oZqItarNkNcFz62JbGnW2spZJjwHIYMGAltvRn12h3U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});