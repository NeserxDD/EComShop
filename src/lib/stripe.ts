// Stripe stub — $0 free tier ready, disabled until you add keys.
// - No monthly fee; test mode is free forever.
// - When ready: set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET in Vercel env.
// - Then: `npm i stripe @stripe/stripe-js` already pending? Install now or later.
// - Uses Checkout Sessions per stripe-best-practices:40 (never payment_method_types, use dynamic methods).

// import Stripe from "stripe";

// export const stripe = process.env.STRIPE_SECRET_KEY
//   ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-26.basil" as unknown as Stripe.LatestApiVersion })
//   : null;

// // Vibecode learning: Checkout Sessions are the $0-way to accept cards without building custom PaymentIntents.
// // Flow: create session → redirect → webhook checkout.session.completed → fulfill order.
// // Keep COD flow intact; Stripe is additive, not replacement.

export const stripe = null as unknown;

// Placeholder for when you wire Stripe later:
export async function createCheckoutSessionStub() {
  throw new Error("Stripe not configured — set STRIPE_SECRET_KEY in .env and uncomment src/lib/stripe.ts");
}
