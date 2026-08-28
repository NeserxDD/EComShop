"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type CartItem = { productId: string; name: string; price: number; qty: number; slug: string; image?: string };

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

  function updateQty(id: string, qty: number) {
    const next = cart.map((c) => (c.productId === id ? { ...c, qty: Math.max(1, qty) } : c));
    localStorage.setItem("ecom_cart", JSON.stringify(next));
    setCart(next);
  }
  function remove(id: string) {
    const next = cart.filter((c) => c.productId !== id);
    localStorage.setItem("ecom_cart", JSON.stringify(next));
    setCart(next);
  }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">Cart empty</h1>
        <p className="text-sm text-zinc-500">Add some products from /products</p>
        <Link href="/products" className="mt-4 inline-block rounded-full bg-black px-6 py-2 text-sm text-white dark:bg-white dark:text-black">
          Browse
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold">Cart — {cart.length} items</h1>
      <div className="mt-6 space-y-3">
        {cart.map((c) => (
          <div key={c.productId} className="flex gap-4 rounded-2xl border p-4 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.image && <img src={c.image} alt={c.name} className="h-16 w-16 rounded-xl object-cover" />}
            <div className="flex-1">
              <Link href={`/products/${c.slug}`} className="font-medium hover:underline">
                {c.name}
              </Link>
              <p className="text-sm text-zinc-500">
                {formatPrice(c.price)} × {c.qty} = {formatPrice(c.price * c.qty)}
              </p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => updateQty(c.productId, c.qty - 1)} className="rounded border px-2 py-1 text-xs dark:border-zinc-800">
                  −
                </button>
                <span className="px-2 py-1 text-xs">{c.qty}</span>
                <button onClick={() => updateQty(c.productId, c.qty + 1)} className="rounded border px-2 py-1 text-xs dark:border-zinc-800">
                  +
                </button>
                <button onClick={() => remove(c.productId)} className="ml-2 text-xs text-red-600">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <span className="font-semibold">Total: {formatPrice(total)}</span>
        <Link href="/checkout" className="rounded-full bg-black px-6 py-2 text-sm text-white dark:bg-white dark:text-black">
          Checkout (COD)
        </Link>
      </div>
      <p className="mt-3 text-xs text-zinc-500">Checkout validates stock server-side + creates Order + InventoryLog in one transaction.</p>
    </div>
  );
}
