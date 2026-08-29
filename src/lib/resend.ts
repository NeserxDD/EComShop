import { Resend } from "resend";

// Warm stone Resend client — free 3k/mo, 100/day, no card
// For portfolio demo without Gmail, we use onboarding@resend.dev as From (no DNS TXT needed)
// To send to real Gmail, verify stoneandcircuit.test at resend.com/domains and change From to repairs@stoneandcircuit.test

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function isResendConfigured() {
  return !!process.env.RESEND_API_KEY && !!resend;
}
