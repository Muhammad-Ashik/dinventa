import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/products";
import { getMarkupSetting } from "@/lib/settings";
import { toggleRetailerActive } from "@/lib/actions/admin";
import { MarkupSettingsForm } from "@/components/admin/markup-settings-form";
import { AddRetailerForm } from "@/components/admin/add-retailer-form";
import { ActionButton } from "@/components/admin/action-button";

export default async function AdminSettingsPage() {
  const [markup, categories, retailers] = await Promise.all([
    getMarkupSetting(),
    getCategories(),
    prisma.vettedRetailer.findMany({ include: { category: true }, orderBy: [{ categoryId: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="font-semibold">Markup rule</h2>
        <MarkupSettingsForm current={markup} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="font-semibold">Vetted retailers</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Only retailers listed here (per category) are ever searched or fetched for real product data. Every
          one must be manually checked for a clean robots.txt and no anti-scraping terms before being added —
          known-banned domains are rejected automatically.
        </p>

        <AddRetailerForm categories={categories} />

        <div className="flex flex-col divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
          {retailers.map((retailer) => (
            <div key={retailer.id} className="flex items-center justify-between gap-3 py-2">
              <div>
                <p className="font-medium">{retailer.name}</p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {retailer.domain} · {retailer.category.name}
                </p>
              </div>
              <form action={toggleRetailerActive.bind(null, retailer.id, !retailer.active)}>
                <ActionButton variant={retailer.active ? "danger" : "primary"} successLabel="Updated">
                  {retailer.active ? "Deactivate" : "Activate"}
                </ActionButton>
              </form>
            </div>
          ))}
          {retailers.length === 0 && (
            <p className="py-2 text-neutral-500 dark:text-neutral-400">No retailers configured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
