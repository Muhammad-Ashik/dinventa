import "server-only";
import { prisma } from "@/lib/prisma";
import { getCourierService } from "@/lib/courier";

// Called from both places that move an Order to CONFIRMED — the Twilio
// gather webhook and the admin manual-override action — so courier
// creation isn't duplicated logic in two spots. Never throws: a courier
// API failure shouldn't undo or block the confirmation itself.
export async function triggerCourierParcel(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return;

  try {
    const courierService = await getCourierService();
    await courierService.createParcel({
      id: order.id,
      recipientName: order.user.name,
      phone: order.phone,
      shippingAddress: order.shippingAddress,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error(`Failed to trigger courier parcel for order ${orderId}:`, error);
  }
}
