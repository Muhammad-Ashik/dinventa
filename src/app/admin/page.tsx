import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import {
  approveProduct,
  rejectProduct,
  manuallyConfirmOrder,
  manuallyDeclineOrder,
  retryConfirmationCall,
  retryCourierOrder,
} from "@/lib/actions/admin";
import { FindTrendingButton } from "@/components/find-trending-button";
import { ActionButton } from "@/components/admin/action-button";

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    pendingOrders,
    pendingProducts,
    pendingConfirmationOrders,
    awaitingCourierOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_CONFIRMATION" } }),
    prisma.pendingProduct.findMany({
      where: { status: "PENDING" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { status: "PENDING_CONFIRMATION" },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { status: "CONFIRMED", courierConsignmentId: null },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Products</p>
          <p className="text-2xl font-semibold">{productCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Orders</p>
          <p className="text-2xl font-semibold">{orderCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Awaiting confirmation</p>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Trending product suggestions</h2>
          <FindTrendingButton />
        </div>

        {pendingProducts.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No pending suggestions. Click &quot;Find trending products&quot; to ask the AI for
            some.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {pendingProducts.map((product) => (
              <div key={product.id} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{product.category.name}</p>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>
                <p className="font-semibold">{formatBDT(product.price)}</p>

                <div className="flex gap-2 pt-1">
                  <form action={approveProduct.bind(null, product.id)}>
                    <ActionButton variant="primary" successLabel="Approved">
                      Approve
                    </ActionButton>
                  </form>
                  <form action={rejectProduct.bind(null, product.id)}>
                    <ActionButton variant="danger" successLabel="Rejected">
                      Reject
                    </ActionButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="font-semibold">Orders awaiting phone confirmation</h2>

        {pendingConfirmationOrders.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No orders are currently awaiting confirmation.</p>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {pendingConfirmationOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium transition-colors hover:text-brand">
                    Order #{order.id.slice(-8)} — {order.user.name}
                  </Link>
                  <p className="font-semibold">{formatBDT(order.totalAmount)}</p>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {order.items.map((item) => `${item.quantity}× ${item.product.name}`).join(", ")}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">Phone: {order.phone}</p>
                {order.confirmationNote && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Note: {order.confirmationNote}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <form action={manuallyConfirmOrder.bind(null, order.id)}>
                    <ActionButton variant="primary" successLabel="Confirmed">
                      Mark confirmed
                    </ActionButton>
                  </form>
                  <form action={manuallyDeclineOrder.bind(null, order.id)}>
                    <ActionButton variant="danger" successLabel="Declined">
                      Mark declined
                    </ActionButton>
                  </form>
                  <form action={retryConfirmationCall.bind(null, order.id)}>
                    <ActionButton variant="neutral" successLabel="Called">
                      Call again
                    </ActionButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="font-semibold">Confirmed orders awaiting courier pickup</h2>

        {awaitingCourierOrders.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No confirmed orders are waiting on a courier.</p>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {awaitingCourierOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium transition-colors hover:text-brand">
                    Order #{order.id.slice(-8)} — {order.user.name}
                  </Link>
                  <p className="font-semibold">{formatBDT(order.totalAmount)}</p>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {order.items.map((item) => `${item.quantity}× ${item.product.name}`).join(", ")}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">Phone: {order.phone}</p>
                {order.courierNote && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Note: {order.courierNote}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <form action={retryCourierOrder.bind(null, order.id)}>
                    <ActionButton variant="neutral" successLabel="Retried">
                      Retry courier order
                    </ActionButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
