"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../store/auth";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // 全局初始化 Supabase Session，解决刷新或重定向后 user 丢失问题
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // 只在客户端挂载时执行一次
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
} 