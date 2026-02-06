import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDA4MjIsImV4cCI6MjA4NTg3NjgyMn0.jb8S3-lFypRQzKyJFt8xycnmbX25_J3DHk6QqcfKhvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
