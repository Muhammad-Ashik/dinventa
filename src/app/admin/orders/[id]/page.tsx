import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
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
import { ActionButton } from "@/components/admin/action-button";

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
        <Link
          href="/admin"
          className="flex w-fit items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-brand dark:text-neutral-400"
        >
          <ArrowLeftIcon className="size-3.5" /> Back to dashboard
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium dark:bg-neutral-800">
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {order.user.name} — {order.user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="font-semibold">Items</h2>
          {!itemsEditable && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Locked — items can only be changed while an order is still pending confirmation.
            </p>
          )}

          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-neutral-500 dark:text-neutral-400">{formatBDT(item.unitPrice)} each</p>
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
                      className="w-16 rounded border border-neutral-300 px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <button
                      type="submit"
                      className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium transition-colors hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
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
                      className="text-xs text-neutral-500 transition-colors hover:text-red-600 active:text-red-700 dark:text-neutral-400"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-neutral-200 pt-3 font-bold dark:border-neutral-800">
            <span>Total</span>
            <span className="text-brand">{formatBDT(order.totalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="mb-3 font-semibold">Shipping info</h2>
            <OrderShippingForm
              orderId={order.id}
              shippingAddress={order.shippingAddress}
              phone={order.phone}
              locked={order.status === "DECLINED" || order.status === "CANCELLED"}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800 text-sm">
            <h2 className="font-semibold">Notes & actions</h2>
            {order.confirmationNote && (
              <p className="text-neutral-600 dark:text-neutral-400">Confirmation: {order.confirmationNote}</p>
            )}
            {order.courierNote && <p className="text-neutral-600 dark:text-neutral-400">Courier: {order.courierNote}</p>}
            {order.courierTrackingCode && (
              <p className="text-neutral-600 dark:text-neutral-400">
                Tracking code: {order.courierTrackingCode} (via Steadfast)
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {order.status === "PENDING_CONFIRMATION" && (
                <>
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
                </>
              )}
              {order.status === "CONFIRMED" && !order.courierConsignmentId && (
                <form action={retryCourierOrder.bind(null, order.id)}>
                  <ActionButton variant="neutral" successLabel="Retried">
                    Retry courier order
                  </ActionButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
