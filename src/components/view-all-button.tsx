import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export function ViewAllButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-dark px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors duration-200 hover:bg-brand-dark sm:gap-1.5 sm:px-7 sm:py-2.5 sm:text-base dark:bg-brand"
    >
      View All
      <ArrowRightIcon className="size-3.5 sm:size-4" />
    </Link>
  );
}
