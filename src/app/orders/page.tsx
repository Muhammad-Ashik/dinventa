import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatBDT } from "@/lib/money";

const STATUS_STYLES: Record<string, string> = {
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  CONFIRMED: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  DECLINED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  SHIPPED: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  DELIVERED: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
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
        <p className="text-neutral-600 dark:text-neutral-400">
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
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 text-sm transition-colors hover:border-brand dark:border-neutral-800"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">
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
