"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type CartItem = { productId: string; variantId?: string | null; variantLabel?: string; name: string; price: number; qty: number; slug: string; image?: string };

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  function load() {
    try {
      setCart(JSON.parse(localStorage.getItem("ecom_cart") || "[]"));
    } catch {
      setCart([]);
    }
  }
  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("cart:updated", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("cart:updated", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  function keyOf(c: CartItem) {
    return `${c.productId}::${c.variantId || ""}`;
  }
  function updateQty(productId: string, variantId: string | null | undefined, qty: number) {
    const k = `${productId}::${variantId || ""}`;
    const next = cart.map((c) => (keyOf(c) === k ? { ...c, qty: Math.max(1, qty) } : c));
    localStorage.setItem("ecom_cart", JSON.stringify(next));
    setCart(next);
  }
  function remove(productId: string, variantId: string | null | undefined) {
    const k = `${productId}::${variantId || ""}`;
    const next = cart.filter((c) => keyOf(c) !== k);
    localStorage.setItem("ecom_cart", JSON.stringify(next));
    setCart(next);
  }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
          Cart empty
        </h1>
        <p className="text-sm text-muted-foreground">Add some products from /products</p>
        <Link href="/products" className="mt-4 inline-block rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm">
          Browse
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold">Cart — {cart.length} items</h1>
      <div className="mt-6 space-y-3">
        {cart.map((c) => (
          <div key={keyOf(c)} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.image && <img src={c.image} alt={c.name} className="h-16 w-16 rounded-xl object-cover" />}
            <div className="flex-1">
              <Link href={`/products/${c.slug}`} className="font-medium hover:underline" style={{ fontFamily: "var(--font-inter)" }}>
                {c.name}
              </Link>
              {c.variantLabel && <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">{c.variantLabel}</p>}
              <p className="text-sm text-muted-foreground">
                {formatPrice(c.price)} × {c.qty} = {formatPrice(c.price * c.qty)}
              </p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => updateQty(c.productId, c.variantId, c.qty - 1)} className="rounded border border-border px-2 py-1 text-xs">
                  −
                </button>
                <span className="px-2 py-1 text-xs">{c.qty}</span>
                <button onClick={() => updateQty(c.productId, c.variantId, c.qty + 1)} className="rounded border border-border px-2 py-1 text-xs">
                  +
                </button>
                <button onClick={() => remove(c.productId, c.variantId)} className="ml-2 text-xs text-red-600">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <span className="font-semibold">Total: {formatPrice(total)}</span>
        <Link href="/checkout" className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm">
          Checkout (COD)
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Checkout validates stock server-side + creates Order + InventoryLog in one transaction.</p>
    </div>
  );
}
