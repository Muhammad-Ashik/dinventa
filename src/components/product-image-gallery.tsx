"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDragSlider } from "@/lib/use-drag-slider";

// Dot-cycle gallery for grid cards — lets a shopper flip through a
// product's real photos (Product.images) right on the card, without
// opening the product page or the quick-view modal, either via the dots or
// by grabbing and dragging left/right. Falls back to a single,
// non-interactive image when there's only one real photo (never pads the
// array with repeats to force dots/dragging to appear).
export function ProductImageGallery({
  images,
  alt,
  href,
  imgClassName = "object-contain p-4",
  sizes = "(max-width: 768px) 50vw, 20vw",
}: {
  images: string[];
  alt: string;
  href?: string;
  imgClassName?: string;
  sizes?: string;
}) {
  const [index, setIndex] = useState(0);
  const { dragHandlers } = useDragSlider(images.length, index, setIndex);
  const current = images[index] ?? images[0];
  const draggable = images.length > 1;

  const image = (
    <Image src={current} alt={alt} fill className={imgClassName} sizes={sizes} draggable={false} />
  );

  return (
    <>
      {href ? (
        <Link
          href={href}
          className={`absolute inset-0 select-none ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
          {...(draggable ? dragHandlers : {})}
        >
          {image}
        </Link>
      ) : (
        <div
          className={`absolute inset-0 select-none ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
          {...(draggable ? dragHandlers : {})}
        >
          {image}
        </div>
      )}

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
