import twilio from "twilio";
import { Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/llm";
import { validateTwilioRequest, twimlResponse } from "@/lib/twilio-webhook";
import { triggerCourierParcel } from "@/lib/confirm-order";

type Intent = "CONFIRM" | "DECLINE" | "UNCLEAR";

const NEGATION_PATTERN = /\b(don'?t|do not|won'?t|not|never)\b/i;
const DECLINE_PATTERN = /\b(cancel|decline|don'?t want|stop|not interested)\b/i;
const CONFIRM_PATTERN =
  /\b(confirm|confirmed|yes|yeah|yep|yup|correct|that'?s right|go ahead|proceed|sounds good)\b/i;

// Instant classification for clear, unambiguous phrases — skips the Gemini
// round-trip entirely (which was leaving several seconds of dead air on the
// call). Falls back to null (→ Gemini) for anything genuinely ambiguous or
// where confirm/decline/negation words appear together, rather than risk a
// fast wrong guess.
function quickIntent(speechResult: string): Intent | null {
  const text = speechResult.trim();
  if (!text) return null;

  const hasDecline = DECLINE_PATTERN.test(text);
  const hasConfirm = CONFIRM_PATTERN.test(text);
  const hasNegation = NEGATION_PATTERN.test(text);

  if (hasDecline && hasConfirm) return null;
  if (hasDecline) return "DECLINE";
  if (hasConfirm && !hasNegation) return "CONFIRM";
  return null;
}

async function interpretIntent(speechResult: string): Promise<Intent> {
  const quick = quickIntent(speechResult);
  if (quick) return quick;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      intent: {
        type: Type.STRING,
        format: "enum",
        enum: ["CONFIRM", "DECLINE", "UNCLEAR"],
        description:
          "CONFIRM if the customer clearly agreed to proceed with the order (e.g. " +
          '"yes", "that\'s right", "go ahead"), DECLINE if they clearly want to cancel ' +
          '(e.g. "no", "cancel it", "I don\'t want it"), UNCLEAR otherwise.',
      },
    },
    required: ["intent"],
  };

  try {
    const text = await generateStructured(
      `A customer was asked to confirm or cancel an order over the phone. They said: "${speechResult}". Classify their intent.`,
      responseSchema,
      '{ "intent": "CONFIRM" | "DECLINE" | "UNCLEAR" }'
    );
    const parsed = JSON.parse(text) as { intent: Intent };
    return parsed.intent ?? "UNCLEAR";
  } catch (error) {
    console.error("interpretIntent: AI call failed:", error);
    return "UNCLEAR";
  }
}

// Twilio POSTs here with the transcribed speech after <Gather> captures it.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const formData = await request.formData();

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (!(await validateTwilioRequest(request, formData))) {
    return new Response("Invalid signature", { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING_CONFIRMATION") {
    twiml.say("This order is no longer awaiting confirmation. Goodbye.");
    twiml.hangup();
    return twimlResponse(twiml);
  }

  const speechResult = formData.get("SpeechResult")?.toString() ?? "";
  const isRetry = new URL(request.url).searchParams.get("retry") === "1";

  if (!speechResult) {
    await prisma.order.update({
      where: { id: orderId },
      data: { confirmationNote: "Call ended without capturing a response — needs manual follow-up." },
    });
    twiml.say("Sorry, we didn't catch that. We'll follow up with you another way. Goodbye.");
    twiml.hangup();
    return twimlResponse(twiml);
  }

  const intent = await interpretIntent(speechResult);

  if (intent === "CONFIRM") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED", confirmationNote: `Confirmed via call: "${speechResult}"` },
    });
    // Deliberately not awaited: courier creation shouldn't add call-hangup
    // latency (we already fixed one dead-air issue this phase) — it keeps
    // running in the background after the TwiML response is sent, safe here
    // since this runs in a persistent Docker container, not a serverless
    // function that would freeze once the response is returned.
    void triggerCourierParcel(orderId);
    twiml.say("Great, your order is confirmed. Thank you!");
    twiml.hangup();
  } else if (intent === "DECLINE") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "DECLINED", confirmationNote: `Declined via call: "${speechResult}"` },
    });
    twiml.say("Okay, we've cancelled your order. Thank you.");
    twiml.hangup();
  } else if (isRetry) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        confirmationNote: `Call ended unclear — needs manual follow-up. Last said: "${speechResult}"`,
      },
    });
    twiml.say("Sorry, I still didn't catch that. We'll follow up with you another way. Goodbye.");
    twiml.hangup();
  } else {
    const gather = twiml.gather({
      input: ["speech"],
      action: `${process.env.PUBLIC_BASE_URL}/api/twilio/gather/${orderId}?retry=1`,
      method: "POST",
      speechTimeout: "auto",
    });
    gather.say(
      "Sorry, I didn't quite catch that. Please say confirm to proceed with your order, or cancel to cancel it."
    );
    twiml.say("We didn't receive a response. Goodbye.");
    twiml.hangup();
  }

  return twimlResponse(twiml);
}
