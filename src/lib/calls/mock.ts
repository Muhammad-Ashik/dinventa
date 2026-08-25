import "server-only";
import type { CallService } from "@/lib/calls/types";

// Used automatically when Twilio isn't configured (src/lib/calls/index.ts).
// Doesn't place a real call — outcomes come from the admin manual-override
// actions (src/lib/actions/admin.ts: manuallyConfirmOrder/manuallyDeclineOrder)
// instead, so the rest of the order-confirmation flow stays testable.
export const mockCallService: CallService = {
  async initiateConfirmationCall(order) {
    console.log(`MOCK: would call ${order.phone} to confirm order ${order.id}`);
  },
};
