import { verifySession, getCurrentUser } from "@/lib/dal";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  await verifySession();
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <CheckoutForm defaultPhone={user?.phone ?? ""} />
    </div>
  );
}
