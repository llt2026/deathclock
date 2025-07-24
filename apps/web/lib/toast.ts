// 简单的 Toast 通知系统
interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
  persistent?: boolean;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];

  show(message: string, options: ToastOptions = {}) {
    const toast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type: options.type || 'info',
      timestamp: Date.now(),
      persistent: options.persistent,
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // 自动移除（除非是持久化的）
    if (!options.persistent) {
      setTimeout(() => {
        this.remove(toast.id);
      }, options.duration || 5000);
    }

    return toast.id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  // 便捷方法
  success(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'error' });
  }

  warning(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'warning' });
  }

  info(message: string, options?: Omit<ToastOptions, 'type'>) {
    return this.show(message, { ...options, type: 'info' });
  }

  // 网络错误处理
  networkError(error?: any) {
    if (!navigator.onLine) {
      return this.error("You're offline. Results will be saved locally.", {
        persistent: true,
        duration: 10000
      });
    }
    
    return this.error("Network error occurred. Please check your connection.", {
      duration: 8000
    });
  }

  // 离线模式提示
  offlineMode() {
    return this.warning("Offline mode - results saved locally only", {
      persistent: true
    });
  }

  // PayPal 错误处理
  paymentError(debugId?: string) {
    const message = debugId 
      ? `Payment failed (ID: ${debugId}). Please try again or contact support.`
      : "Payment failed. Please try again.";
    
    return this.error(message, { duration: 10000 });
  }

  // Vault 上传错误
  vaultUploadError(attempt: number = 1) {
    if (attempt < 3) {
      return this.warning(`Upload failed. Retrying... (${attempt}/3)`, {
        duration: 3000
      });
    } else {
      return this.error("Upload failed after 3 attempts. Check your connection or try Wi-Fi.", {
        duration: 10000
      });
    }
  }
}

export const toast = new ToastManager();

// React Hook
import { useState, useEffect } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  return toasts;
} 