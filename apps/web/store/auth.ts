import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
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

      initAuth: async () => {
        try {
          // 获取当前会话
          const { data: { session } } = await supabase.auth.getSession();
          set({ session, user: session?.user ?? null });

          // 监听认证状态变化
          supabase.auth.onAuthStateChange((event, session) => {
            set({ session, user: session?.user ?? null });
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