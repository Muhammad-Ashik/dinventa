import Link from "next/link";
import { verifyAdmin } from "@/lib/dal";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await verifyAdmin();

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-4 border-b pb-3 text-sm">
        <Link href="/admin" className="font-medium">
          Dashboard
        </Link>
      </nav>
      {children}
    </div>
  );
}
