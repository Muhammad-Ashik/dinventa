"use client";

import { useActionState } from "react";
import { updateMarkupSetting } from "@/lib/actions/admin";
import type { MarkupSettingFormState } from "@/lib/definitions";
import type { MarkupSetting } from "@/lib/settings";

export function MarkupSettingsForm({ current }: { current: MarkupSetting }) {
  const [state, formAction, pending] = useActionState<MarkupSettingFormState, FormData>(
    updateMarkupSetting,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 text-sm">
      <p className="text-neutral-500 dark:text-neutral-400">
        Applied once when a real product is found — never retroactively changes prices already live.
      </p>
      <div className="flex items-center gap-3">
        <select
          name="mode"
          defaultValue={current.mode}
          className="rounded border border-neutral-300 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="flat">Flat (+ taka)</option>
          <option value="percent">Percentage (%)</option>
        </select>
        <input
          name="value"
          type="number"
          min={0}
          step="0.01"
          defaultValue={current.value}
          className="w-32 rounded border border-neutral-300 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state?.errors?.value && <p className="text-red-600">{state.errors.value[0]}</p>}
      {state?.message && (
        <p className={state.errors ? "text-red-600" : "text-green-700 dark:text-green-400"}>{state.message}</p>
      )}
    </form>
  );
}
