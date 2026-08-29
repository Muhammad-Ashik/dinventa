"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDragSlider, wrapSlides } from "@/lib/use-drag-slider";

// Dot-cycle gallery for grid cards — lets a shopper flip through a
// product's real photos (Product.images) right on the card, without
// opening the product page or the quick-view modal, either via the dots or
// by grabbing and dragging left/right. All images render side by side in a
// strip that tracks the cursor in real time while dragging (matching
// HeroSlider), rather than just swapping src on release. Falls back to a
// single, non-interactive image when there's only one real photo (never
// pads the array with repeats to force dots/dragging to appear).
export function ProductImageGallery({
  images,
  alt,
  href,
  imgClassName = "object-contain",
  sizes = "(max-width: 768px) 50vw, 20vw",
}: {
  images: string[];
  alt: string;
  href?: string;
  imgClassName?: string;
  sizes?: string;
}) {
  const [index, setIndex] = useState(0);
  const { dragOffset, skipTransition, position, dragHandlers } = useDragSlider(
    images.length,
    index,
    setIndex
  );
  const draggable = images.length > 1;

  const strip = (
    <div
      className={`flex h-full w-full ${skipTransition ? "" : "transition-transform duration-300 ease-out"}`}
      style={{ transform: `translateX(calc(${-(position + 1) * 100}% + ${dragOffset}px))` }}
    >
      {wrapSlides(images).map((src, i) => (
        <div key={src + i} className="relative h-full w-full shrink-0">
          <Image
            src={src}
            alt={alt}
            fill
            className={`${imgClassName} transition-transform duration-300 ease-out group-hover:scale-105`}
            sizes={sizes}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Drag handlers live on this plain div, with the Link nested inside
          just for navigation. An <a> tag is natively draggable by default
          (for bookmarking/dragging the link itself) regardless of the
          image inside it having draggable={false} — confirmed via
          MutationObserver + pointer-event logging that the browser was
          silently firing pointercancel/lostpointercapture one move into
          the gesture, which is the browser's own native-drag takeover, not
          a DOM mutation or React re-render. draggable={false} on the Link
          itself is the actual fix. */}
      <div
        className={`absolute inset-0 overflow-hidden select-none ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
        {...(draggable ? dragHandlers : {})}
      >
        {href ? (
          <Link href={href} draggable={false} className="absolute inset-0">
            {strip}
          </Link>
        ) : (
          strip
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full shadow transition-all ${
                i === index ? "w-4 bg-brand" : "w-1.5 bg-white/90"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
