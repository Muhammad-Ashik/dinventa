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

const STATUS_STYLES: Record<string, string> = {
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-700"}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="flex flex-col divide-y rounded-lg border border-neutral-200">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-3 text-sm">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatBDT(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between p-3 font-bold">
          <span>Total</span>
          <span className="text-brand">{formatBDT(order.totalAmount)}</span>
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
