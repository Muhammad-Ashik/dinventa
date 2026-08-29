import Link from "next/link";

export function ViewAllButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-lg bg-dark px-7 py-2.5 text-base font-medium text-white transition-colors duration-200 hover:bg-brand-dark"
    >
      View All
    </Link>
  );
}
