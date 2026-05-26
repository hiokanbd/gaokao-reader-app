// Simple API Key storage using localStorage with basic obfuscation
// Web Crypto API (crypto.subtle) requires secure context which may not be
// available in all Android WebView environments
const STORAGE_KEY = 'gk_api_key';

// Simple XOR obfuscation with device-derived key
function obfuscate(text: string): string {
  const seed = (navigator.userAgent || 'gaokao').length + screen.width;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ (seed + i) % 256);
  }
  return btoa(result);
}

function deobfuscate(encoded: string): string {
  const seed = (navigator.userAgent || 'gaokao').length + screen.width;
  const text = atob(encoded);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ (seed + i) % 256);
  }
  return result;
}

export async function encryptApiKey(plaintext: string): Promise<string> {
  const result = obfuscate(plaintext);
  localStorage.setItem(STORAGE_KEY, result);
  return result;
}

export async function decryptApiKey(): Promise<string | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return deobfuscate(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function hasApiKey(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
