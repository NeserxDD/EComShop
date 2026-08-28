"use client";
import { useEffect, useState } from "react";
import { checkoutCOD } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";

type CartItem = { productId: string; variantId?: string | null; variantLabel?: string; qty: number; price: number; name: string };

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("ecom_cart") || "[]"));
    } catch {
      setCart([]);
    }
  }, []);

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  // Clear cart on success is handled by redirect; also clear on mount if order success param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) localStorage.removeItem("ecom_cart");
  }, []);

  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-xl font-bold">Checkout</h1>
        <p className="text-sm text-zinc-500">Cart empty — add products first.</p>
      </div>
    );

  // Server Action reads these hidden fields (variantId included)
  const cartJson = JSON.stringify(cart.map((c) => ({ productId: c.productId, variantId: (c as any).variantId || null, qty: c.qty })));
  const shippingJson = JSON.stringify({ street, city, phone });

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="text-2xl font-bold">Checkout — COD</h1>
      <p className="text-sm text-zinc-500">Pay on delivery. Order will be PENDING, stock decremented server-side.</p>

      <div className="mt-6 rounded-2xl border p-4 text-sm dark:border-zinc-800">
        <p className="font-medium">Order summary: {cart.length} items • Total placeholder {total}</p>
      </div>

      <form action={checkoutCOD} className="mt-6 space-y-4">
        <input type="hidden" name="cart" value={cartJson} />
        <input type="hidden" name="shippingAddress" value={shippingJson} />
        <input
          placeholder="Street / Barangay"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <Button type="submit" className="w-full">
          Place Order (COD) — no Stripe yet
        </Button>
      </form>
      <p className="mt-3 text-xs text-zinc-500">Server validates stock + creates InventoryLog atomically. Sign-in required.</p>
    </div>
  );
}
