"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Variant = { label: string; sku: string; price: string; stockQty: string; options: string; image: string };

export function VariantForm({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    { label: "250GB", sku: "", price: "", stockQty: "10", options: '{"capacity":"250GB"}', image: "" },
  ]);

  function addVariant() {
    setVariants([...variants, { label: "", sku: "", price: "", stockQty: "10", options: "{}", image: "" }]);
  }
  function update(idx: number, field: keyof Variant, value: string) {
    const next = [...variants];
    (next[idx] as any)[field] = value;
    setVariants(next);
  }
  function remove(idx: number) {
    setVariants(variants.filter((_, i) => i !== idx));
  }

  // Prepare JSON for Server Action
  const variantsJson = hasVariants
    ? JSON.stringify(
        variants
          .filter((v) => v.label && v.sku && v.price)
          .map((v) => {
            let opts: Record<string, string> = {};
            try {
              opts = JSON.parse(v.options || "{}");
            } catch {
              opts = {};
            }
            return {
              label: v.label,
              sku: v.sku,
              price: parseFloat(v.price) || 0,
              stockQty: parseInt(v.stockQty || "0", 10) || 0,
              options: opts,
              image: v.image || undefined,
            };
          })
      )
    : "[]";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="checkbox" id="hasVariants" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="rounded" />
        <label htmlFor="hasVariants" className="text-sm font-medium">
          This product has variations (e.g., Seagate 250GB/500GB/1TB, RAM 8GB/16GB, Laptop Silver/Black)
        </label>
      </div>

      {!hasVariants ? (
        <div className="grid grid-cols-2 gap-3">
          <input name="price" type="number" step="0.01" placeholder="Price PHP (single)" required className="rounded-xl border border-border bg-card px-3 py-2 text-sm" />
          <input name="stockQty" type="number" placeholder="Stock qty" defaultValue={10} className="rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
          <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Variations — each has own SKU, price, stock (parent price = lowest, stock = sum)</p>
          {variants.map((v, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Variant {idx + 1}</span>
                <button type="button" onClick={() => remove(idx)} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder='Label e.g., 250GB or Silver' value={v.label} onChange={(e) => update(idx, "label", e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm" />
                <input placeholder="SKU unique" value={v.sku} onChange={(e) => update(idx, "sku", e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Price PHP" type="number" step="0.01" value={v.price} onChange={(e) => update(idx, "price", e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm" />
                <input placeholder="Stock" type="number" value={v.stockQty} onChange={(e) => update(idx, "stockQty", e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm" />
              </div>
              <input placeholder='Options JSON e.g., {"capacity":"250GB"} or {"color":"Silver"}' value={v.options} onChange={(e) => update(idx, "options", e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-mono" />
              <input placeholder="Image URL per variant (optional)" value={v.image} onChange={(e) => update(idx, "image", e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs" />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            + Add variant
          </Button>
          <input type="hidden" name="variants" value={variantsJson} />
          {/* Parent price/stock hidden when has variants — will be derived */}
          <input type="hidden" name="price" value="0" />
          <input type="hidden" name="stockQty" value="0" />
        </div>
      )}

      {!hasVariants && <input type="hidden" name="variants" value="[]" />}
    </div>
  );
}
