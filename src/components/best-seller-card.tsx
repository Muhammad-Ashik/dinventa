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
    <div className="min-h-[320px] rounded-xl bg-[#F6F7FB] p-5 text-center">
      <Link
        href={`/products/${product.slug}`}
        title={product.name}
        className="line-clamp-1 text-lg font-semibold text-neutral-900 transition-colors hover:text-brand"
      >
        {product.name}
      </Link>
      <p className="mt-1.5 flex items-center justify-center gap-2 text-base font-medium">
        <span className="text-neutral-900">{formatBDT(product.price)}</span>
        {onSale && (
          <span className="text-neutral-400 line-through">
            {formatBDT(product.compareAtPrice!)}
          </span>
        )}
      </p>
      <Link href={`/products/${product.slug}`} className="mt-4 flex items-center justify-center">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={180}
          height={180}
          className="object-contain"
        />
      </Link>
    </div>
  );
}
