import "server-only";
import { NextResponse } from "next/server";
import twilio from "twilio";
import type VoiceResponse from "twilio/lib/twiml/VoiceResponse";

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
