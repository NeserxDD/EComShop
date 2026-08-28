import Link from "next/link";

// Vibecode learning: This is a Server Component by default (no "use client").
// Next.js App Router: page.tsx = route UI. layout.tsx = shared wrapper.
// Server Components fetch directly, no useEffect needed.

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero — simple, Tailwind free tier, no extra dependency */}
      <section className="border-b bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            EComShop • Vercel Free • Supabase Free • Cloudinary Free
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Computer Store <span className="text-zinc-400">&</span> Repair — $0 Stack
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Browse laptops, components & peripherals. Request a repair and track it by ticket.
            Next.js 15 + Prisma + Supabase (500MB) + Better Auth + Cloudinary (25GB).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Browse Products
            </Link>
            <Link
              href="/repairs/new"
              className="rounded-full border px-6 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Request Repair →
            </Link>
            <Link
              href="/repairs/track"
              className="rounded-full border px-6 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800"
            >
              Track Ticket
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Phase 0 scaffold — commerce & repair logic wired in Phases 2-3. See{" "}
            <Link href="/admin" className="underline">
              /admin
            </Link>{" "}
            for staff dashboard stub.
          </p>
        </div>
      </section>

      {/* Category preview — static now, will be Prisma-driven in Phase 2 */}
      <section className="mx-auto max-w-6xl w-full px-6 py-10">
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500">
          8 Top Categories → 15 Leaves → 3/leaf seed (40 products)
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Laptops — Gaming / Business",
            "Desktops — Gaming / Office",
            "Components — CPU / GPU / RAM / Storage / Motherboard / PSU",
            "Peripherals — Keyboard / Mouse / Headset",
            "Monitors",
            "Networking — Router / Switch",
            "Accessories — Cables & Adapters",
            "Refurbished",
          ].map((c) => (
            <div key={c} className="rounded-2xl border p-4 text-sm dark:border-zinc-800">
              {c}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl w-full px-6 pb-16 text-xs leading-6 text-zinc-500">
        <p>
          <strong className="text-zinc-900 dark:text-zinc-100">$0 Free Tier:</strong> Supabase 500MB fits ~5k products,
          Cloudinary 25GB fits ~25k images, Vercel 100GB BW. Seed is 40 products (~3MB DB + 30MB images).
        </p>
      </section>
    </div>
  );
}
