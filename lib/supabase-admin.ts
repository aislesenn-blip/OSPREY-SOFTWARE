import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMDgyMiwiZXhwIjoyMDg1ODc2ODIyfQ.tDUQwTAcrYznVA_GaPXR4XXmX4w2CJ2iTBFHOwsemqs';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
