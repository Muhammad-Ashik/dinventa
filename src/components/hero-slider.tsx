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
      <div className="flex min-h-[460px] flex-col items-start justify-center rounded-2xl bg-white p-10 sm:p-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Smart shopping, made for Bangladesh</h1>
        <p className="mt-3 max-w-md text-base text-neutral-600 sm:text-lg">
          Tell our AI what you&apos;re looking for and we&apos;ll find it instantly.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-dark px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
        >
          Shop all products
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-[460px] overflow-hidden rounded-2xl bg-white">
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
              className="flex w-full shrink-0 items-center gap-8 p-10 sm:p-12"
            >
              <div className="flex-1">
                {discountPercent > 0 && (
                  <p className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-brand">{discountPercent}%</span>
                    <span className="text-base font-semibold text-neutral-500">SALE OFF</span>
                  </p>
                )}
                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{p.name}</h1>
                <p className="mt-3 line-clamp-2 max-w-md text-base text-neutral-600 sm:text-lg">
                  {p.description}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <p className="text-2xl font-bold text-brand">{formatBDT(p.price)}</p>
                  {p.compareAtPrice && (
                    <p className="text-base text-neutral-400 line-through">
                      {formatBDT(p.compareAtPrice)}
                    </p>
                  )}
                </div>
                <Link
                  href={`/products/${p.slug}`}
                  className="mt-6 inline-block rounded-lg bg-dark px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
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
