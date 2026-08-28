import { NextResponse } from "next/server";

// Vibecode learning: Stripe webhook stub — required for subscriptions/async payments.
// - Never trust success page; fulfill in webhook `checkout.session.completed` gated on `payment_status === "paid"`.
// - This stub returns 501 until you wire Stripe. Keeps build passing with $0.

export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe webhook not configured",
      hint: "Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in Vercel env, then uncomment src/app/api/stripe/webhook/route.ts per stripe-best-practices/references/payments.md",
    },
    { status: 501 }
  );
}

// When wiring:
// import { stripe } from "@/lib/stripe";
// import { db } from "@/lib/db";
// export async function POST(req: Request) {
//   const sig = req.headers.get("stripe-signature")!;
//   const raw = await req.text();
//   const event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//   if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
//     if (event.data.object.payment_status !== "paid") return NextResponse.json({ received: true });
//     const orderId = event.data.object.metadata?.orderId;
//     await db.order.update({ where: { id: orderId }, data: { status: "PAID", paymentStatus: "PAID" } });
//   }
//   return NextResponse.json({ received: true });
// }
