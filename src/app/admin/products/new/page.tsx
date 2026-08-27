import { getCategories } from "@/lib/products";
import { AddProductForm } from "@/components/admin/add-product-form";

export default async function AdminAddProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Add a product</h1>
      <AddProductForm categories={categories} />
    </div>
  );
}
