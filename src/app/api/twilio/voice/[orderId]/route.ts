import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import { validateTwilioRequest, twimlResponse } from "@/lib/twilio-webhook";

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
    twiml.say("This order is no longer awaiting confirmation. Goodbye.");
    twiml.hangup();
    return twimlResponse(twiml);
  }

  const itemsSummary = order.items
    .map((item) => `${item.quantity} ${item.product.name}`)
    .join(", ");

  const prompt =
    `Hello, this is Dinventa calling to confirm your order of ${itemsSummary}, ` +
    `total ${formatBDT(order.totalAmount)}, shipping to ${order.shippingAddress}. ` +
    "Please say confirm to proceed, or cancel to cancel this order.";

  const gather = twiml.gather({
    input: ["speech"],
    action: `${process.env.PUBLIC_BASE_URL}/api/twilio/gather/${orderId}`,
    method: "POST",
    speechTimeout: "auto",
  });
  gather.say(prompt);

  twiml.say("We didn't receive a response. Goodbye.");
  twiml.hangup();

  return twimlResponse(twiml);
}
