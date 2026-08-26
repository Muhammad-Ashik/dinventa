import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { validateTwilioRequest, twimlResponse, speak, gatherAttributes } from "@/lib/twilio-webhook";

// Twilio fetches this when the outbound confirmation call connects.
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

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.status !== "PENDING_CONFIRMATION") {
    await speak(twiml, "এই অর্ডারটি আর নিশ্চিতকরণের অপেক্ষায় নেই। ধন্যবাদ।");
    twiml.hangup();
    return twimlResponse(twiml);
  }

  // Product names/brands stay in their original (mostly English) form —
  // that's how Bangladeshi customers actually hear them referred to; only
  // the surrounding sentence is Bangla. Kept out of formatBDT() here so the
  // amount is a plain number the Bangla TTS reads out as Bangla number
  // words, followed by "টাকা" (taka), instead of an English currency string.
  const itemsSummary = order.items
    .map((item) => `${item.quantity}টি ${item.product.name}`)
    .join(", ");

  const prompt =
    `হ্যালো, ডিনভেন্টা থেকে বলছি। আপনার অর্ডার নিশ্চিত করার জন্য কল করা হয়েছে: ${itemsSummary}, ` +
    `মোট ${order.totalAmount} টাকা, ঠিকানা ${order.shippingAddress}। ` +
    "অর্ডারটি নিশ্চিত করতে 'কনফার্ম' বলুন, অথবা বাতিল করতে 'ক্যানসেল' বলুন।";

  const gather = twiml.gather(
    gatherAttributes(`${process.env.PUBLIC_BASE_URL}/api/twilio/gather/${orderId}`)
  );
  await speak(gather, prompt);

  await speak(twiml, "কোনো উত্তর পাওয়া যায়নি। ধন্যবাদ।");
  twiml.hangup();

  return twimlResponse(twiml);
}
