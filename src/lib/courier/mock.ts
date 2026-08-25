import "server-only";
import { prisma } from "@/lib/prisma";
import type { CourierService } from "@/lib/courier/types";

// Used automatically when Steadfast isn't configured (src/lib/courier/index.ts).
// Still moves the order to SHIPPED with a fake tracking code, so the rest of
// the flow (order page showing tracking info) stays testable without real
// courier credentials — same idea as the mock call service in Phase 3.
export const mockCourierService: CourierService = {
  async createParcel(order) {
    const trackingCode = `MOCK-${order.id.slice(-8)}`;
    console.log(`MOCK: would create courier parcel for order ${order.id} (${trackingCode})`);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "SHIPPED",
        courierTrackingCode: trackingCode,
        courierNote: "Mock courier parcel (no real courier configured).",
      },
    });
  },
};
