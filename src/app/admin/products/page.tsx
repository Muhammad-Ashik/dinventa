import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/money";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark active:bg-brand-dark"
        >
          Add product
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="flex items-center justify-between gap-3 p-3 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <div className="flex-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-neutral-500 dark:text-neutral-400">
                {product.category.name} · Stock: {product.stock}
              </p>
            </div>
            {product.sourceDomain && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                via {product.sourceDomain}
              </span>
            )}
            <p className="w-24 text-right font-semibold">{formatBDT(product.price)}</p>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">No products yet.</p>
        )}
      </div>
    </div>
  );
}
