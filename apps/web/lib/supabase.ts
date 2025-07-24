import { createClient } from '@supabase/supabase-js';

// 使用测试项目配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cjswqhghqwsxnkcgwdrh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqc3dxaGdocXdzeG5rY2d3ZHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3OTA4NDIsImV4cCI6MjA1MzM2Njg0Mn0.uCoMBXoFZV3_M8sXULOZwdq-3VIq8KbWWQP0RpKsI9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
}); 