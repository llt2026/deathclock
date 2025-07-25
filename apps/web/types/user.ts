import type { User as SupabaseUser } from '@supabase/supabase-js';

// 扩展的用户类型，包含应用特定的字段
export interface AppUser extends SupabaseUser {
  dob?: string; // 出生日期
  sex?: 'male' | 'female'; // 性别
  display_name?: string; // 显示名称
}

// 用户元数据类型
export interface UserMetadata {
  display_name?: string;
  dob?: string;
  sex?: 'male' | 'female';
}

// 数据库用户类型
export interface DbUser {
  id: string;
  email: string;
  display_name?: string;
  dob?: string;
  sex?: 'male' | 'female';
  created_at?: Date;
} 