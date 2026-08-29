"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Vibecode learning: Client cart = localStorage (free, no DB cost for guest).
// - Zustand would be nicer but for MVP plain localStorage + event is enough.
// - Server will validate stock again at checkout — never trust client stock.

type CartItem = { productId: string; variantId?: string | null; variantLabel?: string; name: string; price: number; qty: number; slug: string; image?: string };

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ecom_cart") || "[]");
  } catch {
    return [];
  }
}
function writeCart(cart: CartItem[]) {
  localStorage.setItem("ecom_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:updated"));
}

export function AddToCartButton({
  product,
  stock,
}: {
  product: { id: string; name: string; price: number; slug: string; image?: string; variantId?: string | null; variantLabel?: string };
  stock: number;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function add() {
    const cart = readCart();
    const key = `${product.id}::${product.variantId || ""}`;
    const idx = cart.findIndex((c) => `${c.productId}::${c.variantId || ""}` === key);
    if (idx >= 0) cart[idx].qty += qty;
    else
      cart.push({
        productId: product.id,
        variantId: product.variantId || null,
        variantLabel: product.variantLabel,
        name: product.name,
        price: product.price,
        qty,
        slug: product.slug,
        image: product.image,
      });
    writeCart(cart);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (stock <= 0) return <p className="text-sm text-red-600">Out of stock</p>;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-xl border border-border bg-card">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-sm hover:bg-muted rounded-l-xl">
          −
        </button>
        <span className="min-w-8 text-center text-sm">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(stock, q + 1))} className="px-3 py-2 text-sm hover:bg-muted rounded-r-xl">
          +
        </button>
      </div>
      <Button onClick={add} disabled={added}>
        {added ? "Added ✓" : "Add to Cart"}
      </Button>
      <a href="/cart" className="text-xs underline">
        View cart
      </a>
    </div>
  );
}
