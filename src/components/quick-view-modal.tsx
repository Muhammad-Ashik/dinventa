"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatBDT } from "@/lib/money";
import { AddToCartWithQuantity } from "@/components/add-to-cart-with-quantity";
import { WishlistButton } from "@/components/wishlist-button";
import { useDragSlider, wrapSlides } from "@/lib/use-drag-slider";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
};

export function QuickViewModal({
  product,
  isWishlisted,
  isLoggedIn,
  onClose,
}: {
  product: Product;
  isWishlisted: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [closing, setClosing] = useState(false);
  const { dragOffset, skipTransition, position, dragHandlers } = useDragSlider(
    product.images.length,
    activeImage,
    setActiveImage
  );
  const imageDraggable = product.images.length > 1;

  // Plays the exit animation before actually unmounting (the parent removes
  // this component the instant `onClose` fires) — closing abruptly with no
  // transition at all is far more jarring than a missing open animation.
  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 150);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${
        closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl sm:p-8 dark:bg-surface ${
          closing ? "animate-modal-panel-out" : "animate-modal-panel-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <XMarkIcon className="size-5" />
        </button>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex gap-3">
            {product.images.length > 1 && (
              <div className="flex flex-col gap-2">
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative size-14 shrink-0 overflow-hidden rounded-lg bg-band transition-shadow ${
                      i === activeImage ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-contain" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
            <div
              className={`relative aspect-square flex-1 overflow-hidden rounded-xl bg-band select-none ${
                imageDraggable ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              {...(imageDraggable ? dragHandlers : {})}
            >
              <div
                className={`flex h-full w-full ${skipTransition ? "" : "transition-transform duration-300 ease-out"}`}
                style={{ transform: `translateX(calc(${-(position + 1) * 100}% + ${dragOffset}px))` }}
              >
                {wrapSlides(product.images).map((src, i) => (
                  <div key={src + i} className="relative h-full w-full shrink-0">
                    <Image
                      src={src}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 90vw, 400px"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {onSale && (
              <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                {discountPercent}% OFF
              </span>
            )}
            <Link
              href={`/products/${product.slug}`}
              className="mt-3 text-lg font-bold hover:text-brand sm:text-xl"
            >
              {product.name}
            </Link>
            <p className="mt-3 line-clamp-4 text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xl font-bold text-brand sm:text-2xl">{formatBDT(product.price)}</span>
              {onSale && (
                <span className="text-base text-neutral-400 line-through dark:text-neutral-500">
                  {formatBDT(product.compareAtPrice!)}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {product.stock > 0 ? (
                <AddToCartWithQuantity
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.images[0]}
                  maxQuantity={product.stock}
                  isWishlisted={isWishlisted}
                  isLoggedIn={isLoggedIn}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-red-600">Out of stock</p>
                  <WishlistButton
                    productId={product.id}
                    initialWishlisted={isWishlisted}
                    isLoggedIn={isLoggedIn}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
