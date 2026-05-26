// Audio download + IndexedDB cache using Youdao TTS
const DB_NAME = 'gaokao-audio';
const DB_VERSION = 1;
const STORE = 'audio';
const TTS_API = 'https://dict.youdao.com/dictvoice?audio={}&type=0';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function getCachedAudio(word: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(word.toLowerCase());
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function cacheAudio(word: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, word.toLowerCase());
  } catch { /* ignore cache failures */ }
}

export async function downloadAudio(
  word: string
): Promise<string> {
  const key = word.toLowerCase();

  // Check cache first
  const cached = await getCachedAudio(key);
  if (cached) {
    return URL.createObjectURL(cached);
  }

  // Download from Youdao
  const url = TTS_API.replace('{}', encodeURIComponent(word));
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!resp.ok) throw new Error(`Audio download failed for: ${word}`);

  const blob = await resp.blob();
  if (blob.size < 1000) throw new Error(`Audio too small for: ${word}`);

  // Cache in background
  cacheAudio(word, blob);

  return URL.createObjectURL(blob);
}

export interface DownloadProgress {
  current: number;
  total: number;
  word: string;
  stage: string;
}

export async function downloadAudioBatch(
  words: string[],
  onProgress: (p: DownloadProgress) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const unique = [...new Set(words.map(w => w.toLowerCase()))];

  for (let i = 0; i < unique.length; i++) {
    const word = unique[i];
    onProgress({ current: i + 1, total: unique.length, word, stage: '下载音频' });
    try {
      const url = await downloadAudio(word);
      results.set(word, url);
    } catch {
      // Skip words that fail to download
    }
  }

  return results;
}
