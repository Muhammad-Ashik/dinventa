import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { AccountSidebar } from "@/components/account-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AddressCard } from "@/components/address-card";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  const shipping = addresses.find((a) => a.type === "SHIPPING") ?? null;
  const billing = addresses.find((a) => a.type === "BILLING") ?? null;

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "My Account", href: "/account" }, { label: "Addresses" }]} />

        <div className="flex flex-col gap-6 sm:flex-row">
          <AccountSidebar name={user.name} memberSince={user.createdAt} active="addresses" />

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
            <AddressCard type="SHIPPING" title="Shipping Address" initial={shipping} />
            <AddressCard type="BILLING" title="Billing Address" initial={billing} />
          </div>
        </div>
      </div>
    </div>
  );
}
