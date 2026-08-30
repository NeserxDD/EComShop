import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      {
        error: "Stripe webhook not configured",
        hint: "Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in Vercel env, then Pay with Card will work. COD still works.",
      },
      { status: 501 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const raw = await req.text();
  let event: any;
  try {
    event = stripe!.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle Checkout Sessions completed + async success (e.g., bank transfer)
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as any;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, status: session.payment_status });
    }
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true, warning: "No orderId in metadata" });

    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ received: true, warning: "Order not found" });
    if (order.paymentStatus === "PAID" && order.status === "PAID") {
      return NextResponse.json({ received: true, already: "paid" });
    }

    // Fulfill: mark PAID and decrement variant/product stock + InventoryLog (only on paid, not on session creation)
    await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: "PAID", paymentStatus: "PAID", paymentMeta: { method: "STRIPE", stripeSessionId: session.id } as any } });
      for (const item of order.items as any[]) {
        if (item.variantId) {
          const v: any = await (tx as any).productVariant.findUnique({ where: { id: item.variantId }, select: { stockQty: true, lowStockThreshold: true, label: true } });
          if (v) {
            await (tx as any).productVariant.update({ where: { id: item.variantId }, data: { stockQty: { decrement: item.qty } } });
            await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.qty } } });
            await tx.inventoryLog.create({
              data: { productId: item.productId, variantId: item.variantId, change: -item.qty, reason: "SALE", note: `Stripe Order ${order.orderNo} variant ${v.label}` },
            });
          }
        } else {
          await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.qty } } });
          await tx.inventoryLog.create({ data: { productId: item.productId, change: -item.qty, reason: "SALE", note: `Stripe Order ${order.orderNo}` } });
        }
      }
    });

    // Optionally after() Resend Order → PAID email (reuse Resend pattern)
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await db.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED" as any } });
    }
  }

  return NextResponse.json({ received: true });
}
