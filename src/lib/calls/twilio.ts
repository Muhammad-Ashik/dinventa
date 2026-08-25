import "server-only";
import twilio from "twilio";
import type { CallService } from "@/lib/calls/types";
import { toE164Bangladeshi } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;
const publicBaseUrl = process.env.PUBLIC_BASE_URL!;

const client = twilio(accountSid, authToken);

export const twilioCallService: CallService = {
  async initiateConfirmationCall(order) {
    const to = toE164Bangladeshi(order.phone);
    if (!to) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          confirmationNote: `Couldn't place confirmation call: "${order.phone}" isn't a recognizable Bangladeshi phone number.`,
        },
      });
      return;
    }

    try {
      await client.calls.create({
        to,
        from: fromNumber,
        url: `${publicBaseUrl}/api/twilio/voice/${order.id}`,
        // "completed" is the only valid event name here and covers every
        // terminal outcome — the actual result (no-answer/busy/failed/
        // completed) arrives in the payload's CallStatus field, which
        // src/app/api/twilio/status/[orderId]/route.ts already reads.
        // ("no-answer"/"busy"/"failed" are CallStatus *values*, not valid
        // StatusCallbackEvent names — passing them was rejected by Twilio
        // with a 21626 warning, though "completed" alone still worked.)
        statusCallback: `${publicBaseUrl}/api/twilio/status/${order.id}`,
        statusCallbackEvent: ["completed"],
      });
    } catch (error) {
      console.error(`Failed to place confirmation call for order ${order.id}:`, error);
      const detail = error instanceof Error ? error.message : "Unknown error.";
      await prisma.order.update({
        where: { id: order.id },
        data: { confirmationNote: `Couldn't place confirmation call: ${detail}` },
      });
    }
  },
};
