"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatBDT } from "@/lib/money";
import { useDragSlider, wrapSlides } from "@/lib/use-drag-slider";

type Deal = {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
};

const AUTO_ADVANCE_MS = 5000;

// White-card, text-left/image-right slides built from real on-sale
// products (real discount %, real price) — not generic marketing copy.
export function HeroSlider({ deals }: { deals: Deal[] }) {
  const [index, setIndex] = useState(0);
  const hasDeals = deals.length > 0;
  const { dragOffset, skipTransition, position, next, dragHandlers } = useDragSlider(
    deals.length,
    index,
    setIndex,
    500
  );

  // A ref so the interval (set up once per deals.length) always calls the
  // latest `next` closure without needing to be torn down and recreated
  // every time `index` changes.
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    if (deals.length <= 1) return;
    const id = setInterval(() => nextRef.current(), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [deals.length]);

  if (!hasDeals) {
    return (
      <div className="flex min-h-[460px] flex-col items-start justify-center rounded-2xl bg-surface p-6 sm:p-12">
        <h1 className="text-2xl font-bold sm:text-4xl">Smart shopping, made for Bangladesh</h1>
        <p className="mt-3 max-w-md text-sm text-neutral-600 sm:text-lg dark:text-neutral-400">
          Tell our AI what you&apos;re looking for and we&apos;ll find it instantly.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark sm:px-7 sm:py-3.5 sm:text-base"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-[460px] overflow-hidden rounded-2xl bg-surface">
      <div
        className={`flex h-full cursor-grab touch-pan-y select-none active:cursor-grabbing ${
          skipTransition ? "" : "transition-transform duration-500 ease-out"
        }`}
        style={{ transform: `translateX(calc(${-(position + 1) * 100}% + ${dragOffset}px))` }}
        {...dragHandlers}
      >
        {wrapSlides(deals).map((p, i) => {
          const discountPercent = p.compareAtPrice
            ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
            : 0;
          return (
            <div
              key={p.slug + i}
              className="flex w-full shrink-0 items-center gap-4 p-6 sm:gap-8 sm:p-12"
            >
              <div className="flex-1">
                {discountPercent > 0 && (
                  <p className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-brand sm:text-5xl">{discountPercent}%</span>
                    <span className="text-sm font-semibold text-neutral-500 sm:text-base dark:text-neutral-400">SALE OFF</span>
                  </p>
                )}
                <h1 className="mt-3 text-xl font-bold sm:text-4xl">{p.name}</h1>
                <p className="mt-3 line-clamp-2 max-w-md text-sm text-neutral-600 sm:text-lg dark:text-neutral-400">
                  {p.description}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <p className="text-lg font-bold text-brand sm:text-2xl">{formatBDT(p.price)}</p>
                  {p.compareAtPrice && (
                    <p className="text-sm text-neutral-400 line-through sm:text-base dark:text-neutral-500">
                      {formatBDT(p.compareAtPrice)}
                    </p>
                  )}
                </div>
                <Link
                  href={`/products/${p.slug}`}
                  className="mt-6 inline-block rounded-lg bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark sm:px-7 sm:py-3.5 sm:text-base"
                >
                  Shop Now
                </Link>
              </div>
              <div className="relative hidden size-44 shrink-0 sm:block sm:size-56">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="224px"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {deals.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {deals.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-brand" : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
