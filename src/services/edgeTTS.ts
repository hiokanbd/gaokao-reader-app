// Microsoft Edge TTS — free, no API key required
// Uses the same endpoint as Edge browser's Read Aloud feature

const WS_URL =
  'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const VOICES: Record<string, string> = {
  'en-US-female': 'en-US-AriaNeural',
  'en-US-male': 'en-US-GuyNeural',
  'en-GB-female': 'en-GB-SoniaNeural',
  'en-GB-male': 'en-GB-RyanNeural',
};

export async function synthesizeSpeech(
  text: string,
  voiceKey: string = 'en-US-female',
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const voice = VOICES[voiceKey] || VOICES['en-US-female'];

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const chunks: BlobPart[] = [];
    let totalSize = 0;
    const estimatedSize = text.length * 800; // rough MP3 estimate

    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      // Send configuration
      const config = {
        context: {
          synthesis: {
            audio: {
              metadataoptions: {
                sentenceBoundaryEnabled: false,
                wordBoundaryEnabled: false,
              },
              outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
            },
          },
        },
      };
      ws.send(JSON.stringify(config));

      // Send SSML
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
        `<voice name='${voice}'><prosody rate='0.9' pitch='default'>` +
        text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        `</prosody></voice></speak>`;
      ws.send(ssml);
    };

    ws.onmessage = (event) => {
      const data = event.data;

      if (typeof data === 'string') {
        // Check for error or end marker
        if (data.includes('Path:turn.end')) {
          ws.close();
        }
        return;
      }

      // Binary audio data
      if (data instanceof ArrayBuffer) {
        // Edge TTS sends header info as text in first bytes, then audio data
        // The header format is: "Path:audio\r\n" + binary audio
        const view = new Uint8Array(data);

        // Find the audio data start (after headers)
        // Headers end at "Path:audio\r\n"
        const headerEnd = findHeaderEnd(view);
        if (headerEnd < view.length) {
          const audioData = view.slice(headerEnd);
          chunks.push(audioData);
          totalSize += audioData.length;
          if (onProgress) {
            onProgress(Math.min(99, Math.round((totalSize / estimatedSize) * 100)));
          }
        }
      }
    };

    ws.onclose = () => {
      if (chunks.length === 0) {
        reject(new Error('No audio received'));
        return;
      }
      const blob = new Blob(chunks, { type: 'audio/mp3' });
      if (onProgress) onProgress(100);
      resolve(blob);
    };

    ws.onerror = () => {
      reject(new Error('Edge TTS connection failed'));
    };

    // Timeout after 60 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        reject(new Error('TTS timeout'));
      }
    }, 60000);
  });
}

function findHeaderEnd(data: Uint8Array): number {
  // Look for "Path:audio\r\n" pattern in binary data
  const marker = new TextEncoder().encode('Path:audio\r\n');
  for (let i = 0; i < data.length - marker.length; i++) {
    let match = true;
    for (let j = 0; j < marker.length; j++) {
      if (data[i + j] !== marker[j]) { match = false; break; }
    }
    if (match) return i + marker.length;
  }
  return 0; // No header found, assume all audio
}

/**
 * Split long text into sentences and synthesize each, then combine.
 * Edge TTS handles up to ~3000 chars per request.
 */
export async function synthesizeLongText(
  text: string,
  voiceKey?: string,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const maxChunkLength = 2000;
  const paragraphs = text.split('\n').filter(p => p.trim());
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + ' ' + para).length > maxChunkLength) {
      if (current) chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? ' ' : '') + para;
    }
  }
  if (current) chunks.push(current.trim());

  const audioChunks: BlobPart[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress(i + 1, chunks.length);
    try {
      const blob = await synthesizeSpeech(chunks[i], voiceKey);
      audioChunks.push(blob);
    } catch (e) {
      console.warn(`TTS chunk ${i + 1}/${chunks.length} failed:`, e);
      // Insert silence for failed chunks
      audioChunks.push(new Blob([new Uint8Array(500)], { type: 'audio/mp3' }));
    }
  }

  return new Blob(audioChunks, { type: 'audio/mp3' });
}
