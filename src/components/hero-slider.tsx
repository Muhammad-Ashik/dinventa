"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    title: "Smart shopping, made for Bangladesh",
    body: "Tell our AI what you're looking for and we'll find it instantly.",
    cta: { label: "Shop all products", href: "/products" },
    gradient: "from-brand to-brand-dark",
  },
  {
    title: "Cash on Delivery, nationwide",
    body: "Order now, pay when it arrives at your door — no card needed.",
    cta: { label: "Start shopping", href: "/products" },
    gradient: "from-red-700 to-neutral-900",
  },
  {
    title: "We call to confirm every order",
    body: "A quick phone call before it ships, so there are no surprises.",
    cta: { label: "Browse new arrivals", href: "/products?sort=newest" },
    gradient: "from-neutral-900 to-brand-dark",
  },
];

const AUTO_ADVANCE_MS = 5000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            className={`w-full shrink-0 bg-gradient-to-r px-6 py-10 text-white sm:px-10 sm:py-14 ${slide.gradient}`}
          >
            <h1 className="text-2xl font-bold sm:text-3xl">{slide.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{slide.body}</p>
            <Link
              href={slide.cta.href}
              className="mt-5 inline-block rounded bg-white px-5 py-2.5 text-sm font-semibold text-brand hover:bg-neutral-100"
            >
              {slide.cta.label}
            </Link>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 0 1 0 1.06L8.832 10l3.958 3.71a.75.75 0 1 1-1.024 1.096l-4.5-4.211a.75.75 0 0 1 0-1.096l4.5-4.211a.75.75 0 0 1 1.024-.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 0 1 0-1.06L11.168 10 7.21 6.29a.75.75 0 1 1 1.024-1.096l4.5 4.211a.75.75 0 0 1 0 1.096l-4.5 4.211a.75.75 0 0 1-1.024.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
