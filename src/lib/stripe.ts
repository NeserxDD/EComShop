import Stripe from "stripe";

// Stone & Circuit — Stripe Checkout Sessions (additive to COD)
// - PHP currency per your call, Checkout Sessions per stripe-best-practices:40 (never payment_method_types, use automatic)
// - Test mode free forever: pk_test / sk_test 4242 4242 4242 4242, live only when you set sk_live
// - COD stays at src/lib/actions/cart.ts:1 checkoutCOD, Stripe is second button

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-26.basil" as any })
  : null;

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY && !!stripe;
}

// For client redirect (optional, Sessions uses hosted URL, not PaymentElement)
export async function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
}
