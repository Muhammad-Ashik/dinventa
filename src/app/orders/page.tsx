import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatBDT } from "@/lib/money";

const STATUS_STYLES: Record<string, string> = {
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-green-50 text-green-700",
  DECLINED: "bg-red-50 text-red-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending confirmation",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function MyOrdersPage() {
  const session = await verifySession();

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-600">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/products" className="font-medium text-brand hover:underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 text-sm transition-colors hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-700"}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-neutral-500">
                {order.items.map((item) => `${item.quantity}× ${item.product.name}`).join(", ")}
              </p>
              <p className="font-semibold text-brand">{formatBDT(order.totalAmount)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
