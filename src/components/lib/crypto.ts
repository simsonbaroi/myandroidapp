// Encryption utilities for localStorage data
// Uses Web Crypto API with AES-GCM encryption

const ENCRYPTION_KEY_NAME = 'mch_billing_key';

// Generate a random encryption key
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to storable format
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from stored format
async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Get or create encryption key
async function getKey(): Promise<CryptoKey> {
  let keyStr = sessionStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (!keyStr) {
    const key = await generateKey();
    keyStr = await exportKey(key);
    sessionStorage.setItem(ENCRYPTION_KEY_NAME, keyStr);
    return key;
  }
  
  return await importKey(keyStr);
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback to base64 encoding if crypto not available
    return btoa(encodeURIComponent(data));
  }
}

// Decrypt data
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await getKey();
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    // Fallback: try base64 decoding for legacy data
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch {
      return encryptedData;
    }
  }
}

// Secure localStorage wrapper
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encryptData(value);
      localStorage.setItem(key, encrypted);
    } catch {
      // Fallback to regular storage
      localStorage.setItem(key, value);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    try {
      return await decryptData(value);
    } catch {
      // Return raw value if decryption fails (legacy data)
      return value;
    }
  },
  
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
  
  // Clear sensitive data on session end
  clearSensitiveData(): void {
    sessionStorage.removeItem(ENCRYPTION_KEY_NAME);
  }
};

// Session timeout for security
let sessionTimeout: ReturnType<typeof setTimeout> | null = null;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function resetSessionTimeout(onTimeout?: () => void): void {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }
  
  sessionTimeout = setTimeout(() => {
    secureStorage.clearSensitiveData();
    onTimeout?.();
  }, SESSION_TIMEOUT_MS);
}

export function clearSessionTimeout(): void {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
    sessionTimeout = null;
  }
}
