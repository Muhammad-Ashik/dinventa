import { prisma } from "@/lib/prisma";
import { validateTwilioRequest } from "@/lib/twilio-webhook";

const NOTEWORTHY_STATUSES = new Set(["no-answer", "busy", "failed", "canceled"]);

// Twilio's call-status callback — fires on completion/no-answer/busy/failed.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const formData = await request.formData();

  if (!(await validateTwilioRequest(request, formData))) {
    return new Response("Invalid signature", { status: 403 });
  }

  const callStatus = formData.get("CallStatus")?.toString();

  if (callStatus && NOTEWORTHY_STATUSES.has(callStatus)) {
    await prisma.order.updateMany({
      where: { id: orderId, status: "PENDING_CONFIRMATION" },
      data: { confirmationNote: `Confirmation call attempt: ${callStatus}.` },
    });
  }

  return new Response(null, { status: 204 });
}
