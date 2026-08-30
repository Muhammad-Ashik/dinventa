import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { AccountSidebar } from "@/components/account-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileForm } from "@/components/profile-form";
import { PasswordForm } from "@/components/password-form";

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={[{ label: "My Account", href: "/account" }, { label: "Account Setting" }]} />

        <div className="flex flex-col gap-6 sm:flex-row">
          <AccountSidebar name={user.name} memberSince={user.createdAt} active="settings" />

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="rounded-2xl bg-white p-5 sm:p-6 dark:bg-surface">
              <h2 className="mb-4 font-semibold">Profile</h2>
              <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ""} />
            </div>

            <div className="rounded-2xl bg-white p-5 sm:p-6 dark:bg-surface">
              <h2 className="mb-4 font-semibold">Password Change</h2>
              <PasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
