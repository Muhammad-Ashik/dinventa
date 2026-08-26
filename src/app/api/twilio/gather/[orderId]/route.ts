import twilio from "twilio";
import { Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/llm";
import { validateTwilioRequest, twimlResponse, speak, gatherAttributes } from "@/lib/twilio-webhook";
import { triggerCourierParcel } from "@/lib/confirm-order";

type Intent = "CONFIRM" | "DECLINE" | "UNCLEAR";

// English `\b` word-boundary matching doesn't apply meaningfully to Bangla
// script (JS regex `\w`/`\b` only recognize ASCII word characters), so the
// Bangla alternatives are plain substring alternatives instead, appended
// outside the `\b...\b` English group.
const NEGATION_PATTERN = /\b(don'?t|do not|won'?t|not|never)\b/i;
const DECLINE_PATTERN =
  /\b(cancel|decline|don'?t want|stop|not interested)\b|না|বাতিল|ক্যানসেল/i;
const CONFIRM_PATTERN =
  /\b(confirm|confirmed|yes|yeah|yep|yup|correct|that'?s right|go ahead|proceed|sounds good)\b|হ্যাঁ|জি|নিশ্চিত|ঠিক আছে|কনফার্ম/i;

// Instant classification for clear, unambiguous phrases (English or Bangla)
// — skips the Gemini round-trip entirely (which was leaving several seconds
// of dead air on the call). Falls back to null (→ Gemini) for anything
// genuinely ambiguous or where confirm/decline words appear together (e.g.
// Bangla "না" is both the standalone word "no" *and* a trailing negation
// particle — "কনফার্ম না" would match both patterns and correctly punt to
// Gemini rather than guess), rather than risk a fast wrong guess.
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

// Twilio gives up waiting on this webhook after ~15s total (confirmed live:
// a call timed out with "Configured tt is 15000ms" while generateStructured
// was still working through its Gemini-primary → Gemini-fallback →
// OpenRouter chain — each Gemini attempt alone has a Google-enforced 10s
// floor, so that full chain can easily exceed Twilio's budget on its own).
// Racing against a ceiling well under 15s (leaving room for the DB query,
// TwiML serialization, and network overhead already spent by this point)
// guarantees we always respond in time, at the cost of sometimes abandoning
// a Gemini call that might have succeeded a few seconds later — an
// abandoned call is wasted API quota but otherwise harmless, and "UNCLEAR"
// already degrades gracefully into the existing one-retry re-prompt flow.
const AI_INTENT_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
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
          '"yes"/হ্যাঁ, "that\'s right", "go ahead"), DECLINE if they clearly want to ' +
          'cancel (e.g. "no"/না, "cancel it"/বাতিল, "I don\'t want it"), UNCLEAR otherwise.',
      },
    },
    required: ["intent"],
  };

  try {
    const text = await withTimeout(
      generateStructured(
        `A Bangladeshi customer was asked, in Bangla, to confirm or cancel an order over the ` +
          `phone. They replied (possibly in Bangla, English, or a mix): "${speechResult}". ` +
          "Classify their intent.",
        responseSchema,
        '{ "intent": "CONFIRM" | "DECLINE" | "UNCLEAR" }'
      ),
      AI_INTENT_TIMEOUT_MS
    );
    const parsed = JSON.parse(text) as { intent: Intent };
    return parsed.intent ?? "UNCLEAR";
  } catch (error) {
    console.error("interpretIntent: AI call failed or timed out:", error);
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
    await speak(twiml, "এই অর্ডারটি আর নিশ্চিতকরণের অপেক্ষায় নেই। ধন্যবাদ।");
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
    await speak(twiml, "দুঃখিত, আমরা কোনো উত্তর পাইনি। আমরা অন্যভাবে যোগাযোগ করব। ধন্যবাদ।");
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
    await speak(twiml, "ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে।");
    twiml.hangup();
  } else if (intent === "DECLINE") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "DECLINED", confirmationNote: `Declined via call: "${speechResult}"` },
    });
    await speak(twiml, "ঠিক আছে, আপনার অর্ডারটি বাতিল করা হয়েছে। ধন্যবাদ।");
    twiml.hangup();
  } else if (isRetry) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        confirmationNote: `Call ended unclear — needs manual follow-up. Last said: "${speechResult}"`,
      },
    });
    await speak(twiml, "দুঃখিত, আমরা এখনও বুঝতে পারিনি। আমরা অন্যভাবে যোগাযোগ করব। ধন্যবাদ।");
    twiml.hangup();
  } else {
    const gather = twiml.gather(
      gatherAttributes(`${process.env.PUBLIC_BASE_URL}/api/twilio/gather/${orderId}?retry=1`)
    );
    await speak(
      gather,
      "দুঃখিত, বুঝতে পারিনি। অর্ডারটি নিশ্চিত করতে 'কনফার্ম' বলুন, অথবা বাতিল করতে 'ক্যানসেল' বলুন।"
    );
    await speak(twiml, "কোনো উত্তর পাওয়া যায়নি। ধন্যবাদ।");
    twiml.hangup();
  }

  return twimlResponse(twiml);
}
