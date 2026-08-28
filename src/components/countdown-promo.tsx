"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBDT } from "@/lib/money";

type Product = { slug: string; name: string; price: number; imageUrl: string };

function remaining(endsAt: number) {
  const diff = Math.max(0, endsAt - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// Ticks down to a real, fixed Product.saleEndsAt timestamp set by an admin —
// never a fake per-pageview deadline. Once it hits zero, the deal is gone on
// the next server render anyway (the homepage query only selects future
// saleEndsAt), so this just freezes at zero rather than faking a reset.
export function CountdownPromo({ product, endsAt }: { product: Product; endsAt: string }) {
  const target = new Date(endsAt).getTime();
  // Starts null so the server-rendered markup and the client's first render
  // match exactly (both render "00" placeholders) — computing Date.now() at
  // render time would make the server's snapshot a second or more stale by
  // the time hydration runs, causing a hydration mismatch on "seconds".
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTime(remaining(target));
    const id = setInterval(() => setTime(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = [
    ["Days", time?.days ?? 0],
    ["Hours", time?.hours ?? 0],
    ["Minutes", time?.minutes ?? 0],
    ["Seconds", time?.seconds ?? 0],
  ];

  return (
    <div className="flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl bg-[#F3F4F6] p-8 sm:flex-row">
      <div>
        <p className="text-sm font-medium text-brand">Don&apos;t miss it!</p>
        <h2 className="mt-1 max-w-sm text-2xl font-bold">{product.name}</h2>
        <p className="mt-1 text-neutral-600">{formatBDT(product.price)}</p>

        <div className="mt-5 flex gap-2">
          {units.map(([label, value]) => (
            <div
              key={label}
              className="flex w-16 flex-col items-center rounded-lg border border-neutral-200 bg-white py-2"
            >
              <span className="text-lg font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
              <span className="text-[10px] text-neutral-500">{label}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-5 inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Check it out
        </Link>
      </div>

      <div className="relative size-40 shrink-0 sm:size-48">
        <Image src={product.imageUrl} alt={product.name} fill className="object-contain" sizes="192px" />
      </div>
    </div>
  );
}
