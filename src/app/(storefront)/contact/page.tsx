export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold">Contact the Store</h1>
      <p className="text-sm text-zinc-500">Free tier: form could send via Resend (3k/mo) — stub for now.</p>
      <div className="mt-6 rounded-2xl border p-6 text-sm dark:border-zinc-800">
        <p className="font-medium">EComShop — Computer Store & Repair</p>
        <p className="text-zinc-500">123 Main Street, Manila • 09XX-XXX-XXXX • hello@ecomshop.test</p>
        <p className="mt-3 text-zinc-500">Hours: Mon-Sat 9am-6pm</p>
        <div className="mt-4 space-y-2 text-xs text-zinc-500">
          <p>Future: wire Resend via Server Action</p>
          <pre className="rounded bg-zinc-50 p-3 dark:bg-zinc-900">{`// Server Action stub
"use server";
import { Resend } from "resend";
export async function sendContact(formData) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({ from: "shop@ecomshop.test", to: "owner@...", subject: "Contact", html: "..." });
}`}</pre>
        </div>
      </div>
    </div>
  );
}
