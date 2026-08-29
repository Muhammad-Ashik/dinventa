"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Sign up" }]} />

      {/* Full-bleed grey page canvas (matching the /products page's own
          -mt-8/-mb-8 technique), not just a rounded grey box floating on
          the still-white default page background — the sign-up "window"
          card is the only thing that stays white here. */}
      <div className="relative left-1/2 -mt-8 -mb-8 w-[calc(100vw-var(--scrollbar-width))] -translate-x-1/2 bg-band">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 sm:py-16">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8 dark:bg-surface">
          <h1 className="text-xl font-bold sm:text-3xl">Create an Account</h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Enter your detail below
          </p>

          <form action={action} className="mt-6 flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="John"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@gmail.com"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email[0]}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                required
                placeholder="01XXXXXXXXX"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              {state?.errors?.phone && <p className="text-sm text-red-600">{state.errors.phone[0]}</p>}
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
                <ul className="text-sm text-red-600">
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Re-type Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Re-type your password"
                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
              />
              {state?.errors?.confirmPassword && (
                <p className="text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
              )}
            </div>

            {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-lg bg-dark px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {pending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand transition-colors hover:underline">
              Sign in Now!
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
