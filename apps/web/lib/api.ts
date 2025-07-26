// API 基础配置

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// 用户同步 API
export async function syncUser(userData: {
  id: string;
  email: string;
  display_name?: string;
  dob?: string;
  sex?: 'male' | 'female';
}): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 保存预测结果
export async function savePrediction(predictionData: {
  user_id: string;
  predicted_dod: string;
  base_remaining_years: number;
  adjusted_years?: number;
  factors?: Record<string, unknown>;
}): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/predictions/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(predictionData),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 获取用户资料
export async function getUserProfile(userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/users/profile?userId=${userId}`);
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 更新用户资料
export async function updateUserProfile(userId: string, profileData: {
  displayName?: string;
  dob?: string;
  sex?: 'male' | 'female';
}): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/users/profile?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 获取订阅状态
export async function getSubscriptionStatus(userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/subscriptions/status?userId=${userId}`);
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// Vault 文件上传
export async function uploadVaultFile(formData: FormData): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/vault/upload', {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 获取 Vault 列表
export async function getVaultList(userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/vault/list?userId=${userId}`);
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 下载 Vault 文件
export async function getVaultDownloadUrl(vaultId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/vault/download?vaultId=${vaultId}&userId=${userId}`);
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// 导出用户数据
export async function exportUserData(userId: string): Promise<Blob | null> {
  try {
    const response = await fetch(`/api/users/export?userId=${userId}`);
    if (response.ok) {
      return await response.blob();
    }
    return null;
  } catch {
    return null;
  }
}

// 发送 Magic Link
export async function sendMagicLink(email: string, magicLink: string): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/email/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, magicLink }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
} 