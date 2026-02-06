import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDA4MjIsImV4cCI6MjA4NTg3NjgyMn0.jb8S3-lFypRQzKyJFt8xycnmbX25_J3DHk6QqcfKhvs';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMDgyMiwiZXhwIjoyMDg1ODc2ODIyfQ.tDUQwTAcrYznVA_GaPXR4XXmX4w2CJ2iTBFHOwsemqs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ONLY use this on the server side (API routes, Server Actions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
