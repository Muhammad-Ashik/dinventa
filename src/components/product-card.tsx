import Image from "next/image";
import Link from "next/link";
import { formatBDT } from "@/lib/money";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
    brand: string;
    category: { name: string };
  };
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-neutral-500">
          <span>{product.category.name}</span>
          <span className="text-neutral-400">{product.brand}</span>
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-medium transition-colors hover:text-brand"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-base font-bold text-brand">{formatBDT(product.price)}</p>
        <div className="mt-auto pt-2">
          <AddToCartButton
            productId={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
          />
        </div>
      </div>
    </div>
  );
}
