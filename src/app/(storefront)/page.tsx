import Link from "next/link";

// Vibecode learning: This is a Server Component by default (no "use client").
// Next.js App Router: page.tsx = route UI. layout.tsx = shared wrapper.
// Server Components fetch directly, no useEffect needed.

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Warm mesh hero — one signature gradient, not halftone, anthropics thesis */}
      <section className="warm-mesh border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            — 01 — EComShop · WARM STONE · $0 STACK
          </p>
          <h1
            className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Computer store <span className="text-muted-foreground font-light">&</span> repair
            <span className="block text-2xl sm:text-3xl font-normal text-muted-foreground mt-1">Warm minimal, not plain</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Browse laptops, components & peripherals. Request a repair and track it by ticket — 8 tops → 15 leaves → 3/leaf warm on eyes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Browse Products
            </Link>
            <Link
              href="/repairs/new"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              Request Repair →
            </Link>
            <Link
              href="/repairs/track"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              Track Ticket
            </Link>
          </div>
          <p className="mt-4 text-xs font-mono uppercase tracking-wide text-muted-foreground">
            Stone 50 #fafaf9 · Amber 600 · <Link href="/admin" className="underline">/admin</Link> for staff
          </p>
        </div>
      </section>

      {/* Category preview — warm cards with shadcn radii + warm shadow */}
      <section className="mx-auto max-w-6xl w-full px-6 py-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">— 02 — CATEGORIES</p>
        <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>
          8 tops → 15 leaves → 3/leaf seed
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
            <div
              key={c}
              className="rounded-xl border border-border bg-card p-4 text-sm shadow-[0_4px_24px_rgba(28,25,23,0.06)] hover:shadow-[0_12px_32px_rgba(28,25,23,0.10)] hover:-translate-y-0.5 transition-all"
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl w-full px-6 pb-16">
        <div className="rounded-xl border border-border bg-card p-4 text-xs leading-6 text-muted-foreground shadow-sm">
          <strong className="text-foreground font-medium">$0 Free Tier:</strong> Supabase 500MB fits ~5k products, Cloudinary 25GB fits ~25k images, Vercel 100GB BW. Seed is 45 products (~3MB DB + 30MB images).
        </div>
      </section>
    </div>
  );
}
