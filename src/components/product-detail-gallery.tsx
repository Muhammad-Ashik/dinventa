"use client";

import { useState } from "react";
import Image from "next/image";
import { useDragSlider, wrapSlides } from "@/lib/use-drag-slider";

// Main image (drag-to-swipe, same mechanics as ProductImageGallery) with a
// thumbnail row below it — a separate component from ProductImageGallery
// (which shows small dots instead) since the product detail page has real
// room for a proper thumbnail strip, matching the reference layout.
export function ProductDetailGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const { dragOffset, skipTransition, position, dragHandlers } = useDragSlider(
    images.length,
    index,
    setIndex
  );
  const draggable = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-xl bg-white select-none dark:bg-surface ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        {...(draggable ? dragHandlers : {})}
      >
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
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors sm:size-20 dark:bg-surface ${
                i === index ? "border-brand" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-contain p-1" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
