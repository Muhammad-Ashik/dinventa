import "server-only";
import type { CallService } from "@/lib/calls/types";
import { mockCallService } from "@/lib/calls/mock";

// Real Twilio calling needs all four: account credentials, a purchased
// number, and a public tunnel URL for webhooks to reach this app. Falls
// back to the mock service (src/lib/calls/mock.ts) if any are missing,
// same selection pattern as the Gemini/OpenRouter fallback in src/lib/llm.ts.
//
// Dynamically imported rather than a plain top-level import: twilio.ts
// constructs the Twilio client at module scope, which would throw on load
// if the env vars are unset — so it must only be imported when configured.
export async function getCallService(): Promise<CallService> {
  const isTwilioConfigured =
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_PHONE_NUMBER &&
    !!process.env.PUBLIC_BASE_URL;

  if (!isTwilioConfigured) return mockCallService;

  const { twilioCallService } = await import("@/lib/calls/twilio");
  return twilioCallService;
}
