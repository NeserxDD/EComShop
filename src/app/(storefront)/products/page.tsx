import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

// Vibecode learning: Server Component data fetching.
// - searchParams triggers dynamic rendering (no static cache) — good for personalized catalog.
// - Prisma query uses indexes: categoryId, isActive, slug per schema.
// - Pagination: skip/take with `data-pagination` best practice (cursor better for >10k rows, but offset fine for 45 products).
// - FTS: for 45 products `contains` is fine; for >1k switch to Postgres tsvector per supabase-postgres-best-practices/advanced-full-text-search.md

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}) {
  const { q, cat, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  const take = 12;
  const skip = (pageNum - 1) * take;

  let products: any[] = [];
  let total = 0;
  let categories: any[] = [];
  let subcategories: any[] = [];

  let topActiveSlug: string | null = null;
  let activeName: string | null = null;
  try {
    const where: Record<string, unknown> = { isActive: true };
    if (cat) {
      const c = await db.category.findFirst({ where: { slug: cat }, select: { id: true, parentId: true, slug: true, name: true } });
      if (c) {
        activeName = (c as any).name;
        if ((c as any).parentId) {
          // Leaf (e.g., components-cpu) → show siblings, keep parent top active, filter only leaf
          const parent = await db.category.findFirst({ where: { id: (c as any).parentId }, select: { slug: true } });
          topActiveSlug = parent?.slug || null;
          subcategories = await db.category.findMany({
            where: { parentId: (c as any).parentId },
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
          });
          (where as any).categoryId = c.id; // leaf → only its 3 products
        } else {
          // Top (e.g., components) → IN [parent + children], subchips are children
          const children = await db.category.findMany({ where: { parentId: c.id }, select: { id: true } });
          if (children.length > 0) {
            const ids = [c.id, ...children.map((x: any) => x.id)];
            (where as any).categoryId = { in: ids };
            subcategories = await db.category.findMany({
              where: { parentId: c.id },
              select: { id: true, name: true, slug: true },
              orderBy: { name: "asc" },
            });
            topActiveSlug = c.slug;
          } else {
            // Top-leaf like monitors (no children) → single
            (where as any).categoryId = c.id;
          }
        }
      }
    }
    if (q) {
      // free-tier simple search — case-insensitive contains on name/description
      (where as Record<string, unknown>).OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { category: { select: { name: true, slug: true } } },
      }),
      db.product.count({ where }),
    ]);
    categories = await db.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  } catch {
    // Build with dummy DATABASE_URL — show placeholder instead of crash
    categories = [];
  }

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} found {q ? `for "${q}"` : ""} {activeName ? `in ${activeName}` : cat ? `in ${cat}` : ""} — page {pageNum}/{totalPages}
          </p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search RTX, ThinkPad..."
            className="rounded-full border px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
          <button className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
            Search
          </button>
        </form>
      </div>

      {/* Category chips — warm stone */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full border px-3 py-1 text-xs ${!cat ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?cat=${c.slug}${q ? `&q=${q}` : ""}`}
            className={`rounded-full border px-3 py-1 text-xs ${cat === c.slug || topActiveSlug === c.slug ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {subcategories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground py-1">Filter:</span>
          {subcategories.map((s: any) => (
            <Link
              key={s.id}
              href={`/products?cat=${s.slug}${q ? `&q=${q}` : ""}`}
              className={`rounded-full border px-3 py-1 text-xs ${cat === s.slug ? "bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h3 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
            No products found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or explore our bestsellers.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse all products
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Looking for something specific? <Link href="/contact" className="underline">Contact us</Link> for special orders.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
            const img = imgs[0] || "https://res.cloudinary.com/demo/image/upload/w_600/sample";
            const price = Number((p as unknown as { price: unknown }).price ?? 0);
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-[0_4px_24px_rgba(28,25,23,0.06)] hover:shadow-[0_12px_32px_rgba(28,25,23,0.10)] hover:-translate-y-1 transition-all animate-[fadeUp_500ms_ease-out]"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground">
                    {(p as unknown as { category: { name: string } }).category?.name}
                  </p>
                  <h3 className="font-medium leading-tight" style={{ fontFamily: "var(--font-inter)" }}>
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(price)}</p>
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Stock: {p.stockQty} · {p.sku}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), page: String(n) }).toString()}`}
              className={`rounded-full border px-3 py-1 ${n === pageNum ? "bg-black text-white" : "hover:bg-zinc-50 dark:border-zinc-800"}`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
