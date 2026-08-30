import Link from "next/link";
import {
  ArchiveBoxIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { AccountSidebar } from "@/components/account-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OrderCard } from "@/components/order-card";
import { ViewAllButton } from "@/components/view-all-button";
import { redirect } from "next/navigation";

export default async function AccountDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING_CONFIRMATION").length;
  // "Processing" covers everything past confirmation but not yet delivered —
  // our real order lifecycle has no separate "processing" status of its own.
  const processingOrders = orders.filter((o) => o.status === "CONFIRMED" || o.status === "SHIPPED").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const recentOrders = orders.slice(0, 5);

  const STAT_CARDS = [
    { label: "Total Orders", value: totalOrders, Icon: ArchiveBoxIcon, tint: "bg-brand-light text-brand" },
    { label: "Pending Orders", value: pendingOrders, Icon: ClockIcon, tint: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { label: "Processing Orders", value: processingOrders, Icon: ArrowPathIcon, tint: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
    { label: "Delivered Orders", value: deliveredOrders, Icon: CheckCircleIcon, tint: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400" },
  ];

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "My Account" }]} />

        <div className="flex flex-col gap-6 sm:flex-row">
          <AccountSidebar name={user.name} memberSince={user.createdAt} active="dashboard" />

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STAT_CARDS.map(({ label, value, Icon, tint }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-surface">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                    <Icon className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Recent Orders</h2>
                <ViewAllButton href="/orders" />
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  You haven&apos;t placed any orders yet.{" "}
                  <Link href="/products" className="font-medium text-brand hover:underline">
                    Start shopping
                  </Link>
                  .
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {recentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
