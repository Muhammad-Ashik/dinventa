import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import {
  manuallyConfirmOrder,
  manuallyDeclineOrder,
  retryConfirmationCall,
  retryCourierOrder,
} from "@/lib/actions/admin";
import { FindTrendingButton } from "@/components/find-trending-button";
import { PendingProductsGrid } from "@/components/admin/pending-products-grid";
import { ActionButton } from "@/components/admin/action-button";

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    pendingOrders,
    pendingProducts,
    pendingConfirmationOrders,
    awaitingCourierOrders,
    categories,
    categoryCounts,
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
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.groupBy({ by: ["categoryId"], _count: true }),
  ]);

  // Gap-based default (idea 4) — pre-select whichever category has the
  // fewest live products, so the button nudges toward filling real gaps in
  // the catalog rather than always searching the same one.
  const countByCategoryId = new Map(categoryCounts.map((c) => [c.categoryId, c._count]));
  const categoriesWithCounts = categories.map((c) => ({
    id: c.id,
    name: c.name,
    productCount: countByCategoryId.get(c.id) ?? 0,
  }));
  const defaultCategoryId =
    [...categoriesWithCounts].sort((a, b) => a.productCount - b.productCount)[0]?.id ?? "";

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
          <h2 className="font-semibold">Find real products</h2>
          <FindTrendingButton categories={categoriesWithCounts} defaultCategoryId={defaultCategoryId} />
        </div>

        <PendingProductsGrid products={pendingProducts} />
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
