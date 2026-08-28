import Link from "next/link";

export function ViewAllButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-7 py-2.5 text-base font-medium text-neutral-900 transition-colors duration-200 hover:border-transparent hover:bg-neutral-900 hover:text-white"
    >
      View All
    </Link>
  );
}
