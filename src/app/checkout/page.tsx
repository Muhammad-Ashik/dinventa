import { prisma } from "@/lib/prisma";
import { verifySession, getCurrentUser } from "@/lib/dal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const session = await verifySession();
  const [user, shippingAddress] = await Promise.all([
    getCurrentUser(),
    prisma.address.findUnique({ where: { userId_type: { userId: session.userId, type: "SHIPPING" } } }),
  ]);

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="text-xl font-bold sm:text-2xl">Checkout</h1>

        <CheckoutForm
          defaultShippingAddress={shippingAddress?.address ?? ""}
          defaultPhone={shippingAddress?.phone ?? user?.phone ?? ""}
        />
      </div>
    </div>
  );
}
