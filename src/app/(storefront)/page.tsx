import Link from "next/link";

// Vibecode learning: This is a Server Component by default (no "use client").
// Next.js App Router: page.tsx = route UI. layout.tsx = shared wrapper.
// Server Components fetch directly, no useEffect needed.

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Official warm hero — Genuine parts. Expert care. */}
      <section className="warm-mesh border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            — Official Store & Service Center — Manila
          </p>
          <h1
            className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Stone & Circuit{" "}
            <span className="block text-2xl sm:text-3xl font-normal text-muted-foreground mt-1">Genuine parts. Expert care.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Your trusted computer store & authorized repair center. Same-day diagnostics, warranty on every fix, and carefully curated components.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Shop Collection
            </Link>
            <Link
              href="/repairs/new"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              Book Repair →
            </Link>
            <Link
              href="/repairs/track"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              Track Ticket
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-wide text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">Warranty Included</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">Genuine Parts</span>
            <span className="rounded-full border border-border bg-card px-3 py-1">Free Diagnostic</span>
          </div>
        </div>
      </section>

      {/* Official categories — clean, no seed counts */}
      <section className="mx-auto max-w-6xl w-full px-6 py-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">— Shop by Category</p>
        <h2 className="text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>
          Curated for builders, gamers & professionals
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
        <div className="rounded-xl border border-border bg-card p-5 flex flex-wrap items-center justify-between gap-4 text-sm shadow-sm">
          <div>
            <p className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
              Visit our Manila showroom
            </p>
            <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Mon–Sat 9am–6pm · Repair check-in until 5pm</p>
          </div>
          <Link href="/contact" className="rounded-xl border border-border bg-card px-4 py-2 text-sm hover:bg-muted transition-colors">
            Get Directions
          </Link>
        </div>
      </section>
    </div>
  );
}
