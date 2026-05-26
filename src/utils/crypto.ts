// Simple API Key encryption using Web Crypto API
// Uses PBKDF2 + AES-GCM with device-derived key material
const STORAGE_KEY = 'gk_encrypted_key';

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const material = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.width + 'x' + screen.height,
  ].join('|');

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(material), 'PBKDF2', false, ['deriveKey']
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as any, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plaintext: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await deriveKey(salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any } as any,
    key,
    enc.encode(plaintext)
  );

  const bundle = {
    s: btoa(String.fromCharCode(...salt)),
    i: btoa(String.fromCharCode(...iv)),
    c: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  };

  const result = JSON.stringify(bundle);
  localStorage.setItem(STORAGE_KEY, result);
  return result;
}

export async function decryptApiKey(): Promise<string | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const bundle = JSON.parse(stored);
    const salt = Uint8Array.from(atob(bundle.s) as any, (c: string) => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(bundle.i) as any, (c: string) => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(bundle.c) as any, (c: string) => c.charCodeAt(0));

    const key = await deriveKey(salt);
    const dec = new TextDecoder();
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any } as any,
      key,
      ciphertext as any
    );

    return dec.decode(plaintext);
  } catch {
    return null;
  }
}

export function hasApiKey(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
