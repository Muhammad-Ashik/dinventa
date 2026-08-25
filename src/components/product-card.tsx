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
    category: { name: string };
  };
}) {
  return (
    <div className="flex flex-col gap-2 rounded border p-3">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded bg-neutral-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </Link>
      <p className="text-xs text-neutral-500">{product.category.name}</p>
      <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
        {product.name}
      </Link>
      <p className="font-semibold">{formatBDT(product.price)}</p>
      <AddToCartButton
        productId={product.id}
        name={product.name}
        price={product.price}
        imageUrl={product.imageUrl}
      />
    </div>
  );
}
