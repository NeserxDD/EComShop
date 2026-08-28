"use client";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart";

type Variant = {
  id: string;
  label: string;
  sku: string;
  price: number;
  stockQty: number;
  options: Record<string, string>;
  image?: string | null;
};

export function VariantPicker({
  product,
  variants,
  basePrice,
  baseStock,
  baseImage,
}: {
  product: { id: string; name: string; slug: string };
  variants: Variant[];
  basePrice: number;
  baseStock: number;
  baseImage?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(variants[0]?.id || null);
  const selected = variants.find((v) => v.id === selectedId) || null;

  const price = selected ? selected.price : basePrice;
  const stock = selected ? selected.stockQty : baseStock;
  const sku = selected ? selected.sku : "";
  const image = selected?.image || baseImage;
  const label = selected ? selected.label : "";

  if (variants.length === 0) {
    return <AddToCartButton product={{ id: product.id, name: product.name, price: basePrice, slug: product.slug, image: baseImage }} stock={baseStock} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Choose variation</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((v) => {
            const isActive = v.id === selectedId;
            const opts = Object.entries(v.options || {})
              .map(([k, val]) => `${k}: ${val}`)
              .join(", ");
            return (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`rounded-xl border px-3 py-2 text-sm text-left transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
              >
                <div className="font-medium">{v.label}</div>
                <div className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{formatPrice(v.price)} · Stock {v.stockQty}</div>
                {opts && <div className="text-[10px] font-mono uppercase tracking-wide opacity-70">{opts}</div>}
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="mt-2 text-xs font-mono uppercase tracking-wide text-muted-foreground">
            Selected: {label} · SKU: {sku} · Stock: {stock}
          </p>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">{formatPrice(price)}</span>
        <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Stock: {stock} · SKU: {sku || "—"}</span>
      </div>

      <AddToCartButton
        product={{
          id: product.id,
          name: selected ? `${product.name} — ${selected.label}` : product.name,
          price,
          slug: product.slug,
          image,
          variantId: selected?.id,
          variantLabel: selected?.label,
        } as any}
        stock={stock}
      />
    </div>
  );
}
