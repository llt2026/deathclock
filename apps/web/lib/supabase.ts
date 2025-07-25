import { createClient } from '@supabase/supabase-js';

// 使用 Vercel 环境变量，构建时提供默认值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// 运行时检查环境变量
const isProduction = process.env.NODE_ENV === 'production';
const hasRealConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder_key';

if (isProduction && !hasRealConfig) {
  console.error('Missing Supabase environment variables in production. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
}); 