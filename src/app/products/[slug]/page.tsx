import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {product.category.name}
        </p>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-2xl font-bold text-brand">{formatBDT(product.price)}</p>
        <p className="text-neutral-700">{product.description}</p>
        <span
          className={
            product.stock > 0
              ? "inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
              : "inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
          }
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>

        {product.stock > 0 && (
          <div className="pt-2">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
