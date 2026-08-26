import "server-only";
import { NextResponse } from "next/server";
import twilio from "twilio";
import type VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import { ttsPlayUrl } from "@/lib/tts";

// Twilio has no bn-BD variant — bn-IN is the same written/spoken language
// (Bengali). Used as the <Gather> speech-recognition language. NOT used for
// <Say> — Twilio's <Say language="bn-IN"> silently fails at runtime (errors
// 13512/13331, confirmed via a live call's Twilio notifications: the
// `language` attribute alone only accepts a small legacy voice list that
// excludes Bengali, despite the SDK's SayLanguage type listing "bn-IN" as
// if it were valid). Bengali <Say> requires an explicit Google `voice` name
// instead — see BN_SAY_VOICE below.
export const BN = "bn-IN";

// Explicit Google voice for the Twilio-native <Say> fallback path — required
// instead of `language: BN` (see above). Wavenet tier: good quality, broadly
// available (unlike the newer Chirp3-HD tier, which may need account
// upgrades). Swap for another Google.bn-IN-* voice from VoiceResponse.d.ts's
// SayVoice type if you want a different one.
const BN_SAY_VOICE = "Google.bn-IN-Wavenet-A";

// Twilio signs webhook requests against the exact URL it called — which is
// the public tunnel URL, not whatever `request.url` resolves to inside the
// Docker container. Reconstructing from PUBLIC_BASE_URL is required for
// validation to actually match.
export async function validateTwilioRequest(
  request: Request,
  formData: FormData
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const signature = request.headers.get("X-Twilio-Signature");
  if (!signature) return false;

  const fullUrl = `${process.env.PUBLIC_BASE_URL}${new URL(request.url).pathname}`;
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  return twilio.validateRequest(authToken, signature, fullUrl, params);
}

export function twimlResponse(twiml: VoiceResponse) {
  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

// <Gather language="bn-IN"> alone silently falls back to English speech
// recognition (same "language is not a supported language" warning as the
// old <Say> bug — confirmed live: a Bangla reply was transcribed as garbled
// English text with `language: "en-US"` in the payload). Twilio's default
// speech model only supports ~10 languages; unlocking Bengali requires an
// explicit `speechModel`. "experimental_utterances" is Twilio's pick for
// short single-utterance replies (fits our yes/no-style confirm/decline
// flow) and is one of the two models Twilio's docs confirm include Bengali.
export function gatherAttributes(actionUrl: string): VoiceResponse.GatherAttributes {
  return {
    input: ["speech"],
    language: BN,
    speechModel: "experimental_utterances",
    action: actionUrl,
    method: "POST",
    speechTimeout: "auto",
    // `timeout` (time to wait for speech to START, separate from
    // speechTimeout's end-of-speech silence detection) defaults to 5s —
    // confirmed live too short: a caller who paused briefly after the long
    // prompt before replying caused Gather to give up and fall through to
    // Twilio's own generic fallback WITHOUT ever hitting our action URL (no
    // /gather request in the call's event log at all). 10s gives more room
    // to start speaking after a long prompt.
    timeout: 10,
    // Without this, that same give-up-without-input case skips our webhook
    // entirely — the order silently stays PENDING_CONFIRMATION with no
    // confirmationNote and no record anything even happened. Forcing the
    // action URL to fire either way lets our own route's `!speechResult`
    // branch record a note and respond consistently instead of relying on
    // Twilio's own generic (English) fallback message.
    actionOnEmptyResult: true,
  };
}

// Prefers ElevenLabs (eleven_v3, the only ElevenLabs model with Bengali
// support) via <Play> when configured; falls back to Twilio's native <Say>
// (via an explicit Google Bengali voice, see BN_SAY_VOICE) otherwise or if
// ElevenLabs errors out (see ttsPlayUrl).
export async function speak(
  node: VoiceResponse | VoiceResponse.Gather,
  text: string
): Promise<void> {
  const url = await ttsPlayUrl(text);
  if (url) {
    node.play(url);
  } else {
    node.say({ voice: BN_SAY_VOICE }, text);
  }
}
