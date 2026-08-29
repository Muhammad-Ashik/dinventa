import Image from "next/image";
import Link from "next/link";
import { formatBDT } from "@/lib/money";

export function BestSellerCard({
  product,
}: {
  product: {
    slug: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string;
  };
}) {
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <div className="min-h-[360px] rounded-xl bg-band p-5 text-center sm:p-7">
      <Link
        href={`/products/${product.slug}`}
        title={product.name}
        className="text-lg font-semibold text-neutral-900 transition-colors hover:text-brand sm:text-xl dark:text-neutral-100"
      >
        {product.name}
      </Link>
      <p className="mt-2 flex items-center justify-center gap-2 text-base font-medium sm:text-lg">
        <span className="text-brand">{formatBDT(product.price)}</span>
        {onSale && (
          <span className="text-neutral-400 line-through dark:text-neutral-500">
            {formatBDT(product.compareAtPrice!)}
          </span>
        )}
      </p>
      <Link href={`/products/${product.slug}`} className="mt-5 flex items-center justify-center">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={200}
          height={200}
          className="object-contain"
        />
      </Link>
    </div>
  );
}
