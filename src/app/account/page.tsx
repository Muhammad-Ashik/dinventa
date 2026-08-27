import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { ProfileForm } from "@/components/profile-form";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 rounded-lg border border-neutral-200 p-6">
      <h1 className="text-2xl font-bold">Profile settings</h1>
      <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ""} />
    </div>
  );
}
