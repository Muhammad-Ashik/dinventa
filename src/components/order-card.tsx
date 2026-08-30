import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { formatBDT } from "@/lib/money";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/order-status";

type OrderCardData = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { name: string; imageUrl: string };
  }[];
};

// One shared, image-led card for every order list (dashboard "Recent
// Orders" and the full /orders page) — replaces a plain data table, which
// read as a generic admin grid and forced a separate cramped mobile layout
// just to dodge horizontal scrolling. A card is naturally responsive and
// gives real product thumbnails room to breathe.
export function OrderCard({ order }: { order: OrderCardData }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-brand dark:border-neutral-700 dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3 sm:px-5 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold">#{order.id.slice(-8)}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 px-4 sm:px-5 dark:divide-neutral-800">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-band">
              <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Qty: {item.quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-medium">{formatBDT(item.unitPrice * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-neutral-100 px-4 py-3 sm:px-5 dark:border-neutral-800">
        <p>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">Total: </span>
          <span className="font-bold text-brand">{formatBDT(order.totalAmount)}</span>
        </p>
        <span className="flex items-center gap-0.5 text-sm font-medium text-neutral-600 transition-colors group-hover:text-brand dark:text-neutral-400">
          View Details
          <ChevronRightIcon className="size-4" />
        </span>
      </div>
    </Link>
  );
}
