"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { formatBDT } from "@/lib/money";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { AddToCartWithQuantity } from "@/components/add-to-cart-with-quantity";
import { useDragSlider } from "@/lib/use-drag-slider";

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
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [, startTransition] = useTransition();
  const { dragHandlers } = useDragSlider(product.images.length, activeImage, setActiveImage);
  const imageDraggable = product.images.length > 1;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  function handleWishlistClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setWishlisted((w) => !w);
    startTransition(async () => {
      await toggleWishlist(product.id);
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl sm:p-8 dark:bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
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
                    className={`relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted ${
                      i === activeImage ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-contain p-1" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
            <div
              className={`relative aspect-square flex-1 overflow-hidden rounded-xl bg-surface-muted select-none ${
                imageDraggable ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              {...(imageDraggable ? dragHandlers : {})}
            >
              <Image
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 90vw, 400px"
                draggable={false}
              />
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
              className="mt-3 text-xl font-bold hover:text-brand"
            >
              {product.name}
            </Link>
            <p className="mt-3 line-clamp-4 text-sm text-neutral-600 dark:text-neutral-400">{product.description}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold text-brand">{formatBDT(product.price)}</span>
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
                />
              ) : (
                <p className="text-sm font-medium text-red-600">Out of stock</p>
              )}

              <button
                type="button"
                onClick={handleWishlistClick}
                className="flex items-center justify-center gap-1.5 rounded bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {wishlisted ? (
                  <HeartSolid className="size-4" />
                ) : (
                  <HeartOutline className="size-4" />
                )}
                {wishlisted ? "Added to wishlist" : "Add to wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
