import { db } from "@/lib/db";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { VariantForm } from "./variant-form";

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
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        New Product — Stone & Circuit
      </h1>
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Cloudinary warm upload (25GB free) — file or URL</p>
      <form action={createProduct} encType="multipart/form-data" className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <input name="name" placeholder="Name (e.g., Seagate Barracuda HDD)" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <input name="sku" placeholder="Base SKU (unique, e.g., SKU-STOR-0001)" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <select name="categoryId" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm">
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.slug})
            </option>
          ))}
        </select>
        <textarea name="description" placeholder="Description" rows={3} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <VariantForm categories={categories} />
        <div className="rounded-xl border border-dashed border-border p-3">
          <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Upload image (Cloudinary) — optional (parent)</label>
          <input name="imageFile" type="file" accept="image/*" className="mt-1 w-full text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Or paste URLs JSON below (fallback for demo)</p>
        </div>
        <input name="images" placeholder='Images JSON: ["https://res.cloudinary.com/..."]' className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <Button type="submit">Create Product</Button>
      </form>
    </div>
  );
}
