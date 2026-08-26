import "server-only";
import { randomUUID } from "node:crypto";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// ElevenLabs' "Rachel" premade voice — a reasonable general-purpose default.
// Swap via ELEVENLABS_VOICE_ID once you've picked a voice from the ElevenLabs
// voice library that actually sounds good for Bangla (voice quality per
// language is subjective and best judged by ear, not guessed here).
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

export const ttsEnabled = Boolean(ELEVENLABS_API_KEY);

interface CachedAudio {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
}

// Twilio fetches the <Play> URL immediately after we return the TwiML that
// references it, so a short in-memory cache (not a DB table) is enough —
// this is call-setup scratch space, not durable data.
const audioCache = new Map<string, CachedAudio>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function pruneExpired() {
  const now = Date.now();
  for (const [id, entry] of audioCache) {
    if (entry.expiresAt < now) audioCache.delete(id);
  }
}

export function getCachedAudio(id: string): CachedAudio | undefined {
  pruneExpired();
  return audioCache.get(id);
}

// eleven_v3 is the only ElevenLabs model with Bengali support — the default
// eleven_multilingual_v2 (29 languages) and eleven_flash_v2_5 (32 languages)
// both omit it; v3 added Bengali among ~40 newly-added languages.
async function synthesize(text: string): Promise<CachedAudio> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({ text, model_id: "eleven_v3" }),
        signal: controller.signal,
      }
    );
    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${await response.text()}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType: "audio/mpeg", expiresAt: Date.now() + CACHE_TTL_MS };
  } finally {
    clearTimeout(timeout);
  }
}

// Synthesizes `text` via ElevenLabs and returns a URL Twilio's <Play> can
// fetch. Returns null (caller should fall back to Twilio's own <Say>) if
// ElevenLabs isn't configured, times out, or errors — a quota hiccup or
// network blip should never break the call.
export async function ttsPlayUrl(text: string): Promise<string | null> {
  if (!ttsEnabled) return null;
  try {
    const audio = await synthesize(text);
    const id = randomUUID();
    pruneExpired();
    audioCache.set(id, audio);
    return `${process.env.PUBLIC_BASE_URL}/api/tts/${id}`;
  } catch (error) {
    console.error("ttsPlayUrl: ElevenLabs synthesis failed, falling back to Twilio Say:", error);
    return null;
  }
}
