import "server-only";
import { prisma } from "@/lib/prisma";
import type { CourierService } from "@/lib/courier/types";
import { toLocalBangladeshi } from "@/lib/phone";

const BASE_URL = "https://portal.steadfast.com.bd/api/v1";
const TIMEOUT_MS = 15_000;

export const steadfastCourierService: CourierService = {
  async createParcel(order) {
    const recipientPhone = toLocalBangladeshi(order.phone);
    if (!recipientPhone) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          courierNote: `Couldn't create courier parcel: "${order.phone}" isn't a recognizable Bangladeshi phone number.`,
        },
      });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/create_order`, {
        method: "POST",
        headers: {
          "Api-Key": process.env.STEADFAST_API_KEY!,
          "Secret-Key": process.env.STEADFAST_SECRET_KEY!,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({
          invoice: order.id,
          recipient_name: order.recipientName,
          recipient_phone: recipientPhone,
          recipient_address: order.shippingAddress,
          cod_amount: order.totalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.consignment) {
        throw new Error(data.message ?? `Steadfast request failed: ${res.status}`);
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "SHIPPED",
          courierConsignmentId: String(data.consignment.consignment_id),
          courierTrackingCode: data.consignment.tracking_code,
          courierNote: null,
        },
      });
    } catch (error) {
      console.error(`Failed to create courier parcel for order ${order.id}:`, error);
      const detail = error instanceof Error ? error.message : "Unknown error.";
      await prisma.order.update({
        where: { id: order.id },
        data: { courierNote: `Couldn't create courier parcel: ${detail}` },
      });
    }
  },
};
