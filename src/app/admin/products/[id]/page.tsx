import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/products";
import { EditProductForm } from "@/components/admin/edit-product-form";
import { SourcedProductPanel } from "@/components/admin/sourced-product-panel";

export default async function AdminProductEditPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="flex w-fit items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-brand dark:text-neutral-400"
        >
          <ArrowLeftIcon className="size-3.5" /> Back to products
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit product</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <EditProductForm product={product} categories={categories} />
        </div>

        {product.sourceUrl && (
          <SourcedProductPanel
            product={{
              id: product.id,
              sourceUrl: product.sourceUrl,
              sourceDomain: product.sourceDomain,
              realPrice: product.realPrice,
              price: product.price,
              lastVerifiedAt: product.lastVerifiedAt,
              sourceCheckStatus: product.sourceCheckStatus,
            }}
          />
        )}
      </div>
    </div>
  );
}
