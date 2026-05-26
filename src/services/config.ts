const STORAGE_KEY = 'xilian_api_base_url';
const DEFAULT_BASE = 'http://127.0.0.1:8000';

let _baseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (_baseUrl) return _baseUrl;
  // Check localStorage override first, then bundled config
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { _baseUrl = stored; return _baseUrl; }
  } catch {}
  _baseUrl = DEFAULT_BASE;
  return _baseUrl;
}

export function setApiBaseUrl(url: string): void {
  _baseUrl = url.replace(/\/+$/, '');
  try { localStorage.setItem(STORAGE_KEY, _baseUrl); } catch {}
}

export function getApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}
