"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// Create Stripe Checkout Session — additive to COD, PHP, variant-aware, COD flow intact
// - Validates same PH address + variant stock as checkoutCOD
// - Creates Order PENDING with paymentMeta:{method:"STRIPE", stripeSessionId:null} first, then Stripe session with metadata.orderId
// - Client redirects to session.url (hosted checkout.stripe.com), webhook fulfills on paid

type CartItem = { productId: string; variantId?: string | null; qty: number };

export async function createStripeCheckout(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const userEmail = (session?.user as { email?: string } | undefined)?.email;
  if (!userId) redirect("/sign-in?next=/checkout");

  if (!isStripeConfigured() || !stripe) {
    // Keep COD working, Stripe shows not configured until keys set (your 3 no Stripe yet)
    throw new Error("Stripe not configured — set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local and Vercel env, then Pay with Card will work. COD still works.");
  }

  const cartRaw = String(formData.get("cart") || "[]");
  const shippingRaw = String(formData.get("shippingAddress") || "{}");
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartRaw);
  } catch {
    throw new Error("Invalid cart");
  }
  if (!cart.length) throw new Error("Cart empty");

  const shipping = JSON.parse(shippingRaw || "{}") as {
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    region?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
  if (!shipping.street || !shipping.city || !shipping.province || !shipping.region || !shipping.zip || !shipping.phone) {
    throw new Error("Missing address: street, city, province, region, zip, phone required");
  }

  const productIds = [...new Set(cart.map((c) => c.productId))];
  const variantIds = [...new Set(cart.map((c) => c.variantId).filter(Boolean) as string[])];
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, stockQty: true },
  });
  const variants = variantIds.length
    ? await (db as any).productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        select: { id: true, price: true, stockQty: true, label: true, productId: true },
      })
    : [];

  const pMap = new Map(products.map((p) => [p.id, p]));
  const vMap = new Map(variants.map((v: any) => [v.id, v]));

  // Validate stock and build line_items + total (never trust client total)
  let total = 0;
  const line_items: any[] = [];
  for (const item of cart) {
    if (item.variantId) {
      const v: any = vMap.get(item.variantId);
      if (!v) throw new Error(`Variant not found: ${item.variantId}`);
      if (v.stockQty < item.qty) throw new Error(`Insufficient stock for variant ${v.label}: ${v.stockQty} left`);
      total += Number(v.price) * item.qty;
      const product = pMap.get(item.productId);
      line_items.push({
        price_data: {
          currency: "php",
          product_data: { name: `${product?.name || "Product"} — ${v.label}` },
          unit_amount: Math.round(Number(v.price) * 100),
        },
        quantity: item.qty,
      });
    } else {
      const p = pMap.get(item.productId);
      if (!p) throw new Error(`Product not found: ${item.productId}`);
      if (p.stockQty < item.qty) throw new Error(`Insufficient stock for ${p.name}: ${p.stockQty} left`);
      total += Number(p.price) * item.qty;
      line_items.push({
        price_data: {
          currency: "php",
          product_data: { name: p.name },
          unit_amount: Math.round(Number(p.price) * 100),
        },
        quantity: item.qty,
      });
    }
  }

  // Create Order PENDING first (so webhook has orderId to fulfill), stock NOT decremented yet — decrement only on webhook paid
  const orderNo = `ECOM-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const order = await db.order.create({
    data: {
      orderNo,
      userId,
      total,
      shippingAddress: shipping as any,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMeta: { method: "STRIPE", stripeSessionId: null } as any,
    },
  });

  for (const item of cart) {
    const unitPrice = item.variantId ? Number((vMap.get(item.variantId) as any).price) : Number(pMap.get(item.productId)!.price);
    await db.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId || null,
        qty: item.qty,
        unitPrice,
      },
    });
  }

  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
  const stripeSession = await stripe!.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${baseUrl}/checkout?success=1&orderId=${order.id}`,
    cancel_url: `${baseUrl}/checkout?canceled=1&orderId=${order.id}`,
    metadata: { orderId: order.id, userId },
    customer_email: userEmail || undefined,
    // @ts-ignore — automatic_payment_methods enabled for dynamic methods (per stripe-best-practices)
    automatic_payment_methods: { enabled: true } as any,
  } as any);

  await db.order.update({ where: { id: order.id }, data: { paymentMeta: { method: "STRIPE", stripeSessionId: stripeSession.id } as any } });

  redirect(stripeSession.url!);
}
