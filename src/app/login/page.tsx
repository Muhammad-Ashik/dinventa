"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Sign in" }]} />

      {/* Full-bleed grey page canvas (matching the /products page's own
          -mt-8/-mb-8 technique), not just a rounded grey box floating on
          the still-white default page background — the sign-in "window"
          card is the only thing that stays white here. */}
      <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 sm:py-16">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8 dark:bg-surface">
          <h1 className="text-xl font-bold sm:text-3xl">Sign In to Your Account</h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Enter your detail below
          </p>

          <form action={action} className="mt-6 flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="example@gmail.com"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              {state?.errors?.email && (
                <p className="text-sm text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              {state?.errors?.password && (
                <p className="text-sm text-red-600">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-lg bg-dark px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-brand transition-colors hover:underline">
              Sign Up Now!
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
