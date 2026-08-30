"use client";
import { useEffect, useState } from "react";
import { checkoutCOD } from "@/lib/actions/cart";
import { createStripeCheckout } from "@/lib/actions/stripe";
import { Button } from "@/components/ui/button";

type CartItem = { productId: string; variantId?: string | null; variantLabel?: string; qty: number; price: number; name: string };
type Addr = { id: string; label: string; street: string; barangay: string | null; city: string; province: string; region: string; zip: string; country: string; isDefault: boolean };

export function CheckoutForm({ addresses }: { addresses: Addr[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>(addresses.find((a) => a.isDefault)?.id || "");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("ecom_cart") || "[]"));
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) localStorage.removeItem("ecom_cart");
  }, []);

  useEffect(() => {
    const sel = addresses.find((a) => a.id === selectedId);
    if (sel) {
      setStreet(sel.street);
      setBarangay(sel.barangay || "");
      setCity(sel.city);
      setProvince(sel.province);
      setRegion(sel.region);
      setZip(sel.zip);
    } else if (selectedId === "") {
      setStreet("");
      setBarangay("");
      setCity("");
      setProvince("");
      setRegion("");
      setZip("");
    }
  }, [selectedId, addresses]);

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-xl font-bold">Checkout</h1>
        <p className="text-sm text-muted-foreground">Cart empty — add products first.</p>
      </div>
    );

  const cartJson = JSON.stringify(cart.map((c) => ({ productId: c.productId, variantId: (c as any).variantId || null, qty: c.qty })));

  // Build shippingAddress with full PH fields + autocomplete-ready names
  const shippingAddress = { street, barangay, city, province, region, zip, country: "PH", phone };
  const shippingJson = JSON.stringify(shippingAddress);

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        Checkout — COD
      </h1>
      <p className="text-sm text-muted-foreground">Pay on delivery. Order will be PENDING, stock decremented server-side. Choose saved address or enter new.</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
        <p className="font-medium">Order summary: {cart.length} items · Total {total}</p>
        <p className="text-xs text-muted-foreground">Variant-aware: Seagate 1TB vs 250GB tracked separately.</p>
      </div>

      {addresses.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Use saved address</p>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <option value="">— Enter new address —</option>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}: {a.street}, {a.barangay ? `${a.barangay}, ` : ""}{a.city}, {a.province} {a.zip} {a.isDefault ? "(Default)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <form action={checkoutCOD} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <input type="hidden" name="cart" value={cartJson} />
        <input type="hidden" name="shippingAddress" value={shippingJson} />
        <input name="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street / House No." required autoComplete="address-line1" className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
        <input name="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} placeholder="Barangay (optional)" autoComplete="address-line2" className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City / Municipality" required autoComplete="address-level2" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
          <input name="province" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Province" required autoComplete="address-level1" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region (e.g., NCR)" required className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
          <input name="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP / Postal Code" required autoComplete="postal-code" inputMode="numeric" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required autoComplete="tel" inputMode="tel" className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="saveAddress" value="true" /> Save this address to My Account (Home/Work)
        </label>
        <div className="grid gap-2">
          <Button type="submit" className="w-full">
            Place Order (COD) — Cash on Delivery
          </Button>
          <Button type="submit" formAction={createStripeCheckout} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
            Pay with Card — Stripe Checkout (PHP) →
          </Button>
          <p className="text-xs text-center text-muted-foreground">Stripe test: 4242 4242 4242 4242 — needs STRIPE_SECRET_KEY in .env.local (currently shows “Stripe not configured” until you set it at dashboard.stripe.com/test)</p>
        </div>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">Server validates street/city/province/region/zip/phone + variant stock atomically. Sign-in required. Full PH address per Baymard/web.dev: address-line1 + address-line2 (Barangay optional) + city + province/region + postal-code, autocomplete + inputmode.</p>
    </div>
  );
}
