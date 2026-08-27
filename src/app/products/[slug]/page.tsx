import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";
import { AddToCartWithQuantity } from "@/components/add-to-cart-with-quantity";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";

const TRUST_BADGES = [
  { icon: "💵", label: "Cash on Delivery" },
  { icon: "📞", label: "We call to confirm your order" },
  { icon: "🚚", label: "Nationwide delivery" },
];

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, status: "ACTIVE", id: { not: product.id } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: product.category.name, href: `/products?category=${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                <span>{product.category.name}</span>
                <span className="text-neutral-300">•</span>
                <span>{product.brand}</span>
              </p>
              <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-brand">{formatBDT(product.price)}</p>
              <span
                className={
                  product.stock > 0
                    ? "inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                    : "inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                }
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <p className="leading-relaxed text-neutral-700">{product.description}</p>

            {product.stock > 0 && (
              <div className="pt-1">
                <AddToCartWithQuantity
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  maxQuantity={product.stock}
                />
              </div>
            )}

            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-sm text-neutral-700">
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
