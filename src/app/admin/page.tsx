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
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <p className="text-sm text-neutral-500">Products</p>
          <p className="text-2xl font-semibold">{productCount}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-neutral-500">Orders</p>
          <p className="text-2xl font-semibold">{orderCount}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-neutral-500">Awaiting confirmation</p>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Trending product suggestions</h2>
          <FindTrendingButton />
        </div>

        {pendingProducts.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No pending suggestions. Click &quot;Find trending products&quot; to ask the AI for
            some.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {pendingProducts.map((product) => (
              <div key={product.id} className="flex flex-col gap-2 rounded border p-3">
                <div className="relative aspect-square w-full overflow-hidden rounded bg-neutral-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <p className="text-xs text-neutral-500">{product.category.name}</p>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-neutral-600">{product.description}</p>
                <p className="font-semibold">{formatBDT(product.price)}</p>

                <div className="flex gap-2 pt-1">
                  <form action={approveProduct.bind(null, product.id)}>
                    <button
                      type="submit"
                      className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectProduct.bind(null, product.id)}>
                    <button
                      type="submit"
                      className="rounded border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded border p-4">
        <h2 className="font-semibold">Orders awaiting phone confirmation</h2>

        {pendingConfirmationOrders.length === 0 ? (
          <p className="text-sm text-neutral-500">No orders are currently awaiting confirmation.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {pendingConfirmationOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-brand">
                    Order #{order.id.slice(-8)} — {order.user.name}
                  </Link>
                  <p className="font-semibold">{formatBDT(order.totalAmount)}</p>
                </div>
                <p className="text-neutral-500">
                  {order.items.map((item) => `${item.quantity}× ${item.product.name}`).join(", ")}
                </p>
                <p className="text-neutral-500">Phone: {order.phone}</p>
                {order.confirmationNote && (
                  <p className="text-xs text-neutral-500">Note: {order.confirmationNote}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <form action={manuallyConfirmOrder.bind(null, order.id)}>
                    <button
                      type="submit"
                      className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Mark confirmed
                    </button>
                  </form>
                  <form action={manuallyDeclineOrder.bind(null, order.id)}>
                    <button
                      type="submit"
                      className="rounded border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Mark declined
                    </button>
                  </form>
                  <form action={retryConfirmationCall.bind(null, order.id)}>
                    <button
                      type="submit"
                      className="rounded border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
                    >
                      Call again
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded border p-4">
        <h2 className="font-semibold">Confirmed orders awaiting courier pickup</h2>

        {awaitingCourierOrders.length === 0 ? (
          <p className="text-sm text-neutral-500">No confirmed orders are waiting on a courier.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {awaitingCourierOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-brand">
                    Order #{order.id.slice(-8)} — {order.user.name}
                  </Link>
                  <p className="font-semibold">{formatBDT(order.totalAmount)}</p>
                </div>
                <p className="text-neutral-500">
                  {order.items.map((item) => `${item.quantity}× ${item.product.name}`).join(", ")}
                </p>
                <p className="text-neutral-500">Phone: {order.phone}</p>
                {order.courierNote && (
                  <p className="text-xs text-neutral-500">Note: {order.courierNote}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <form action={retryCourierOrder.bind(null, order.id)}>
                    <button
                      type="submit"
                      className="rounded border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
                    >
                      Retry courier order
                    </button>
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
