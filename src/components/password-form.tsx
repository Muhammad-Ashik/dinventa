"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/lib/actions/auth";

const inputClass =
  "rounded-lg border border-neutral-300 px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message && !state.errors) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="oldPassword" className="text-sm font-medium">
          Old Password
        </label>
        <input
          id="oldPassword"
          name="oldPassword"
          type="password"
          required
          className={inputClass}
        />
        {state?.errors?.oldPassword && (
          <p className="text-sm text-red-600">{state.errors.oldPassword[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          className={inputClass}
        />
        {state?.errors?.newPassword && (
          <p className="text-sm text-red-600">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmNewPassword" className="text-sm font-medium">
          Confirm New Password
        </label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          required
          className={inputClass}
        />
        {state?.errors?.confirmNewPassword && (
          <p className="text-sm text-red-600">{state.errors.confirmNewPassword[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className={state.errors ? "text-sm text-red-600" : "text-sm text-green-700 dark:text-green-400"}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
