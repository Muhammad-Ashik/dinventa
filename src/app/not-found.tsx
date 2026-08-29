import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Error" }]} />

      <div className="flex flex-col items-center rounded-2xl bg-surface px-4 py-12 text-center sm:px-6 sm:py-20">
        <p className="text-6xl font-extrabold text-brand sm:text-9xl">404</p>
        <h1 className="mt-6 text-xl font-bold sm:text-3xl">Sorry, the page can&apos;t be found</h1>
        <p className="mt-3 max-w-md text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
          The page you were looking for appears to have been moved, deleted or does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:mt-8"
        >
          <ArrowLeftIcon className="size-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
