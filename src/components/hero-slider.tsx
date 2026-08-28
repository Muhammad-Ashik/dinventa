"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatBDT } from "@/lib/money";

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

  useEffect(() => {
    if (deals.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % deals.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [deals.length]);

  if (!hasDeals) {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center rounded-2xl bg-white p-8 sm:p-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Smart shopping, made for Bangladesh</h1>
        <p className="mt-2 max-w-md text-sm text-neutral-600 sm:text-base">
          Tell our AI what you&apos;re looking for and we&apos;ll find it instantly.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-block rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl bg-white">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {deals.map((p) => {
          const discountPercent = p.compareAtPrice
            ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
            : 0;
          return (
            <div
              key={p.slug}
              className="flex w-full shrink-0 items-center gap-6 p-8 sm:p-10"
            >
              <div className="flex-1">
                {discountPercent > 0 && (
                  <p className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-brand">{discountPercent}%</span>
                    <span className="text-sm font-semibold text-neutral-500">SALE OFF</span>
                  </p>
                )}
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{p.name}</h1>
                <p className="mt-2 line-clamp-2 max-w-md text-sm text-neutral-600 sm:text-base">
                  {p.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <p className="text-xl font-bold text-brand">{formatBDT(p.price)}</p>
                  {p.compareAtPrice && (
                    <p className="text-sm text-neutral-400 line-through">
                      {formatBDT(p.compareAtPrice)}
                    </p>
                  )}
                </div>
                <Link
                  href={`/products/${p.slug}`}
                  className="mt-5 inline-block rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
                >
                  Shop Now
                </Link>
              </div>
              <div className="relative hidden size-40 shrink-0 sm:block sm:size-48">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="192px"
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
                i === index ? "w-6 bg-brand" : "w-1.5 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
