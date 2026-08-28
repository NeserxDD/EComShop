import { db } from "@/lib/db";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories: { id: string; name: string; slug: string }[] = [];
  try {
    categories = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
  } catch {
    categories = [];
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold">New Product</h1>
      <p className="text-xs text-zinc-500">Images: paste Cloudinary URLs as JSON array e.g. [&quot;https://res.cloudinary.com/...&quot;]</p>
      <form action={createProduct} className="mt-4 space-y-3 rounded-2xl border p-4 dark:border-zinc-800">
        <input name="name" placeholder="Name (e.g., RTX 4060 8GB)" required className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800" />
        <input name="sku" placeholder="SKU (unique, e.g., SKU-GPU-0001)" required className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800" />
        <div className="grid grid-cols-2 gap-3">
          <input name="price" type="number" step="0.01" placeholder="Price PHP" required className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-800" />
          <input name="stockQty" type="number" placeholder="Stock qty" defaultValue={10} className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-800" />
        </div>
        <select name="categoryId" required className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800">
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.slug})
            </option>
          ))}
        </select>
        <textarea name="description" placeholder="Description" rows={3} className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800" />
        <input name="images" placeholder='Images JSON: ["https://..."]' className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800" />
        <Button type="submit">Create Product</Button>
      </form>
    </div>
  );
}
