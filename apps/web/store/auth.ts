import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { syncUser } from '../lib/api';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  deviceId: string;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
  syncUserToDatabase: (user: User) => Promise<void>;
}

// 生成设备ID用于游客模式
const generateDeviceId = () => {
  return 'device_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      deviceId: typeof window !== 'undefined' ? 
        localStorage.getItem('deviceId') || generateDeviceId() : generateDeviceId(),

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ isLoading: loading }),

      signInWithMagicLink: async (email: string) => {
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/verify`,
            },
          });
          if (error) throw error;
        } catch (error) {
          console.error('Magic link error:', error);
          throw new Error('Failed to send magic link');
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, session: null });
        } catch (error) {
          console.error('Sign out error:', error);
          throw new Error('Sign out failed');
        }
      },

      syncUserToDatabase: async (user: User) => {
        try {
          const userData = {
            id: user.id,
            email: user.email!,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
            dob: user.user_metadata?.dob,
            sex: user.user_metadata?.sex,
          };

          const result = await syncUser(userData);
          if (!result.success) {
            console.error('User sync failed:', result.error);
          }
        } catch (error) {
          console.error('User sync error:', error);
        }
      },

      initAuth: async () => {
        try {
          // 获取当前会话
          const { data: { session } } = await supabase.auth.getSession();
          set({ session, user: session?.user ?? null });

          // 如果用户已登录，同步到数据库
          if (session?.user) {
            get().syncUserToDatabase(session.user);
          }

          // 监听认证状态变化
          supabase.auth.onAuthStateChange(async (event, session) => {
            set({ session, user: session?.user ?? null });
            
            // 用户登录时同步到数据库
            if (event === 'SIGNED_IN' && session?.user) {
              await get().syncUserToDatabase(session.user);
            }
          });
        } catch (error) {
          console.error('Auth init error:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        deviceId: state.deviceId 
      }),
    }
  )
);

// 初始化时保存设备ID
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState();
  localStorage.setItem('deviceId', store.deviceId);
} 