import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { getProductsNeedingReview, getUserReviews } from "@/lib/reviews";
import { AccountSidebar } from "@/components/account-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AccountReviewsTabs } from "@/components/account-reviews-tabs";

export default async function AccountReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [needsReview, reviewed] = await Promise.all([
    getProductsNeedingReview(user.id),
    getUserReviews(user.id),
  ]);

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "My Account", href: "/account" }, { label: "My Review" }]} />

        <div className="flex flex-col gap-6 sm:flex-row">
          <AccountSidebar name={user.name} memberSince={user.createdAt} active="reviews" />

          <div className="min-w-0 flex-1">
            <AccountReviewsTabs needsReview={needsReview} reviewed={reviewed} />
          </div>
        </div>
      </div>
    </div>
  );
}
