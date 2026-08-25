import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatBDT } from "@/lib/money";

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending phone confirmation",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrderStatusPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  const session = await verifySession();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || (order.userId !== session.userId && session.role !== "ADMIN")) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(-8)}</h1>
        <p className="text-neutral-600">
          Status: <span className="font-medium">{STATUS_LABELS[order.status]}</span>
        </p>
      </div>

      <div className="flex flex-col divide-y rounded border">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-3 text-sm">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatBDT(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between p-3 font-semibold">
          <span>Total</span>
          <span>{formatBDT(order.totalAmount)}</span>
        </div>
      </div>

      <div className="text-sm text-neutral-600">
        <p>Shipping to: {order.shippingAddress}</p>
        <p>Contact phone: {order.phone}</p>
        {order.courierTrackingCode && (
          <p>Tracking code: {order.courierTrackingCode} (via Steadfast)</p>
        )}
      </div>
    </div>
  );
}
