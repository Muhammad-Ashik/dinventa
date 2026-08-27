import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import {
  manuallyConfirmOrder,
  manuallyDeclineOrder,
  retryConfirmationCall,
  retryCourierOrder,
  updateOrderItemQuantity,
  removeOrderItem,
} from "@/lib/actions/admin";
import { OrderShippingForm } from "@/components/admin/order-shipping-form";

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending phone confirmation",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AdminOrderDetailPage(props: PageProps<"/admin/orders/[id]">) {
  const { id } = await props.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } },
  });
  if (!order) notFound();

  const itemsEditable = order.status === "PENDING_CONFIRMATION";
  const canRemoveItems = itemsEditable && order.items.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-sm text-neutral-500 hover:text-brand">
          ← Back to dashboard
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-sm text-neutral-600">
          {order.user.name} — {order.user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded border p-4">
          <h2 className="font-semibold">Items</h2>
          {!itemsEditable && (
            <p className="text-xs text-neutral-500">
              Locked — items can only be changed while an order is still pending confirmation.
            </p>
          )}

          <div className="flex flex-col divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-neutral-500">{formatBDT(item.unitPrice)} each</p>
                </div>

                {itemsEditable ? (
                  <form
                    action={updateOrderItemQuantity.bind(null, order.id, item.id)}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="number"
                      name="quantity"
                      min={1}
                      max={item.product.stock + item.quantity}
                      defaultValue={item.quantity}
                      className="w-16 rounded border border-neutral-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="submit"
                      className="rounded border px-2 py-1 text-xs font-medium hover:bg-neutral-50"
                    >
                      Update
                    </button>
                  </form>
                ) : (
                  <p className="w-16 text-center">× {item.quantity}</p>
                )}

                <p className="w-24 text-right font-semibold">
                  {formatBDT(item.unitPrice * item.quantity)}
                </p>

                {canRemoveItems && (
                  <form action={removeOrderItem.bind(null, order.id, item.id)}>
                    <button
                      type="submit"
                      className="text-xs text-neutral-500 hover:text-red-600"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span className="text-brand">{formatBDT(order.totalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded border p-4">
            <h2 className="mb-3 font-semibold">Shipping info</h2>
            <OrderShippingForm
              orderId={order.id}
              shippingAddress={order.shippingAddress}
              phone={order.phone}
              locked={order.status === "DECLINED" || order.status === "CANCELLED"}
            />
          </div>

          <div className="flex flex-col gap-2 rounded border p-4 text-sm">
            <h2 className="font-semibold">Notes & actions</h2>
            {order.confirmationNote && (
              <p className="text-neutral-600">Confirmation: {order.confirmationNote}</p>
            )}
            {order.courierNote && <p className="text-neutral-600">Courier: {order.courierNote}</p>}
            {order.courierTrackingCode && (
              <p className="text-neutral-600">
                Tracking code: {order.courierTrackingCode} (via Steadfast)
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {order.status === "PENDING_CONFIRMATION" && (
                <>
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
                </>
              )}
              {order.status === "CONFIRMED" && !order.courierConsignmentId && (
                <form action={retryCourierOrder.bind(null, order.id)}>
                  <button
                    type="submit"
                    className="rounded border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
                  >
                    Retry courier order
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
