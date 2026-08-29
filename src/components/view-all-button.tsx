import Link from "next/link";

export function ViewAllButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-lg bg-dark px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-dark sm:px-7 sm:py-2.5 sm:text-base dark:bg-brand"
    >
      View All
    </Link>
  );
}
