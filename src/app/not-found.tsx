import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Error" }]} />

      <div className="flex flex-col items-center rounded-2xl bg-surface px-6 py-20 text-center">
        <p className="text-8xl font-extrabold text-brand sm:text-9xl">404</p>
        <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Sorry, the page can&apos;t be found</h1>
        <p className="mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
          The page you were looking for appears to have been moved, deleted or does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <ArrowLeftIcon className="size-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
