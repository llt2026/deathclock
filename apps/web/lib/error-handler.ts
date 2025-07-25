// 简化的错误处理模块
export enum ErrorType {
  NETWORK_OFFLINE = "NETWORK_OFFLINE",
  UPLOAD_FAILED = "UPLOAD_FAILED", 
  SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
  AUTH_FAILED = "AUTH_FAILED",
  API_ERROR = "API_ERROR",
  UNKNOWN = "UNKNOWN"
}

export interface AppError {
  type: ErrorType;
  message: string;
  debugInfo?: any;
  retry?: () => void;
}

// 简化的错误处理函数
export function handleError(type: ErrorType, message: string, debugInfo?: any, retry?: () => void) {
  console.error(`[${type}]`, message, debugInfo);
  
  // 简单的 alert 处理
  alert(message);
  
  if (retry) {
    const shouldRetry = confirm("Would you like to retry?");
    if (shouldRetry) {
      retry();
    }
  }
} 