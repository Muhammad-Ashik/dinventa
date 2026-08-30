import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { AccountSidebar } from "@/components/account-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OrderCard } from "@/components/order-card";

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "My Account", href: "/account" }, { label: "Orders" }]} />

        <div className="flex flex-col gap-6 sm:flex-row">
          <AccountSidebar name={user.name} memberSince={user.createdAt} active="orders" />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <h1 className="text-xl font-bold">Your Orders</h1>

            {orders.length === 0 ? (
              <div className="rounded-2xl bg-white p-5 dark:bg-surface">
                <p className="text-neutral-600 dark:text-neutral-400">
                  You haven&apos;t placed any orders yet.{" "}
                  <Link href="/products" className="font-medium text-brand hover:underline">
                    Start shopping
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
