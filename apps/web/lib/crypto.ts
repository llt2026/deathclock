// Legacy Vault 客端加密工具
// 按产品文档：用户自设 4-6 位 PIN → PBKDF2 派生密钥 → AES-256-GCM 加密

export class VaultCrypto {
  private static PBKDF2_ITERATIONS = 100000;
  private static KEY_LENGTH = 256; // bits

  // 验证 PIN 格式（4-6 位数字）
  static validatePin(pin: string): boolean {
    return /^\d{4,6}$/.test(pin);
  }

  // 从 PIN 和用户 UID 派生 AES-256 密钥
  static async deriveKey(pin: string, userUid: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    
    // 使用 userUid 作为盐
    const salt = encoder.encode(userUid);
    const pinData = encoder.encode(pin);
    
    // 导入 PIN 作为原始密钥材料
    const pinKey = await crypto.subtle.importKey(
      "raw",
      pinData,
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    
    // 使用 PBKDF2 派生 AES-256 密钥
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      pinKey,
      {
        name: "AES-GCM",
        length: this.KEY_LENGTH,
      },
      false,
      ["encrypt", "decrypt"]
    );
    
    return derivedKey;
  }

  // 加密文件数据
  static async encryptFile(
    fileData: ArrayBuffer,
    pin: string,
    userUid: string
  ): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> {
    const key = await this.deriveKey(pin, userUid);
    
    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM 推荐 96-bit IV
    
    // AES-GCM 加密
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      fileData
    );
    
    return { iv, ciphertext };
  }

  // 解密文件数据
  static async decryptFile(
    encryptedData: { iv: Uint8Array; ciphertext: ArrayBuffer },
    pin: string,
    userUid: string
  ): Promise<ArrayBuffer> {
    const key = await this.deriveKey(pin, userUid);
    
    // AES-GCM 解密
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedData.iv,
      },
      key,
      encryptedData.ciphertext
    );
    
    return decrypted;
  }

  // 将加密数据编码为 Base64 (便于存储传输)
  static encodeEncryptedData(iv: Uint8Array, ciphertext: ArrayBuffer): string {
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  // 从 Base64 解码加密数据
  static decodeEncryptedData(encoded: string): { iv: Uint8Array; ciphertext: ArrayBuffer } {
    const combined = new Uint8Array(
      atob(encoded)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12); // GCM IV 长度
    const ciphertext = combined.slice(12).buffer;
    
    return { iv, ciphertext };
  }
}

// PIN 本地存储管理
export class PinManager {
  private static PIN_STORAGE_KEY = "vault_pin";

  static savePin(pin: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.PIN_STORAGE_KEY, pin);
    }
  }

  static getPin(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.PIN_STORAGE_KEY);
    }
    return null;
  }

  static clearPin(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.PIN_STORAGE_KEY);
    }
  }

  static hasPin(): boolean {
    return this.getPin() !== null;
  }
} 