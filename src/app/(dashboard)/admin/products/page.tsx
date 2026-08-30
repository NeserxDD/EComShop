import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { toggleProductActive, updateProductStock, updateVariantStock, toggleVariantActive } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ show?: string }>;
}) {
  const show = (await searchParams)?.show || "active";
  let where: any = {};
  if (show === "active") where = { isActive: true };
  else if (show === "inactive") where = { isActive: false };
  let products: any[] = [];
  try {
    products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { category: { select: { name: true, slug: true } }, variants: { orderBy: { price: "asc" } } },
    });
  } catch {
    return <div className="text-sm text-muted-foreground">DB not configured — run migrate & seed.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
          Products — {products.length}
        </h1>
        <Link href="/admin/products/new" className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 shadow-sm">
          + New Product
        </Link>
      </div>
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Soft isActive:false hides from storefront (keeps orders), not hard delete — DB stays ~3MB. Add/Remove per variant via -1/+5/+10.</p>
      <div className="mt-3 flex gap-2 text-xs">
        <a href="/admin/products?show=active" className={`rounded-full border px-3 py-1 ${show === "active" ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
          Active
        </a>
        <a href="/admin/products?show=inactive" className={`rounded-full border px-3 py-1 ${show === "inactive" ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
          Inactive (soft)
        </a>
        <a href="/admin/products" className={`rounded-full border px-3 py-1 ${!show || show === "all" ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
          All
        </a>
      </div>

      <div className="mt-4 space-y-4">
        {products.map((p: any) => {
          const cat = p.category;
          const variants = p.variants || [];
          const hasVariants = variants.length > 0;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <Link href={`/products/${p.slug}`} className="font-medium hover:underline" style={{ fontFamily: "var(--font-inter)" }}>
                    {p.name}
                  </Link>
                  <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                    {p.sku} · {cat?.name} · {hasVariants ? `${variants.length} variants` : "no variants"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded-full border px-2 py-1 text-xs ${p.isActive ? "bg-primary text-primary-foreground" : "border-border bg-muted"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button size="sm" variant={p.isActive ? "default" : "outline"}>
                      {p.isActive ? "Deactivate (soft)" : "Activate"}
                    </Button>
                  </form>
                </div>
              </div>

              {!hasVariants ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{formatPrice(Number(p.price))}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${p.stockQty <= p.lowStockThreshold ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" : "border-border"}`}>
                    Stock {p.stockQty} {p.stockQty <= p.lowStockThreshold && "LOW"}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <form action={updateProductStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value="-1" />
                      <input type="hidden" name="reason" value="ADJUSTMENT" />
                      <Button size="sm" variant="outline">
                        −1
                      </Button>
                    </form>
                    <form action={updateProductStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value="5" />
                      <input type="hidden" name="reason" value="RESTOCK" />
                      <Button size="sm" variant="outline">
                        +5
                      </Button>
                    </form>
                    <form action={updateProductStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value="10" />
                      <input type="hidden" name="reason" value="RESTOCK" />
                      <Button size="sm" variant="outline">
                        +10
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Variants — each own price/stock/sku (parent {formatPrice(Number(p.price))} min, stock {p.stockQty} sum)</p>
                  {variants.map((v: any) => (
                    <div key={v.id} className={`flex flex-wrap items-center gap-2 rounded-xl border p-2 ${v.isActive ? "border-border bg-card" : "border-dashed bg-muted"}`}>
                      <span className="text-sm font-medium flex-1 min-w-[100px]">
                        {v.label} <span className="text-xs font-mono text-muted-foreground">{v.sku}</span>
                      </span>
                      <span className="text-sm">{formatPrice(Number(v.price))}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${v.stockQty <= v.lowStockThreshold ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" : "border-border"}`}>
                        Stock {v.stockQty} {v.stockQty <= v.lowStockThreshold && "LOW"}
                      </span>
                      <div className="ml-auto flex gap-1">
                        <form action={updateVariantStock}>
                          <input type="hidden" name="variantId" value={v.id} />
                          <input type="hidden" name="delta" value="-1" />
                          <input type="hidden" name="reason" value="ADJUSTMENT" />
                          <Button size="sm" variant="outline">
                            −1
                          </Button>
                        </form>
                        <form action={updateVariantStock}>
                          <input type="hidden" name="variantId" value={v.id} />
                          <input type="hidden" name="delta" value="5" />
                          <input type="hidden" name="reason" value="RESTOCK" />
                          <Button size="sm" variant="outline">
                            +5
                          </Button>
                        </form>
                        <form action={updateVariantStock}>
                          <input type="hidden" name="variantId" value={v.id} />
                          <input type="hidden" name="delta" value="10" />
                          <input type="hidden" name="reason" value="RESTOCK" />
                          <Button size="sm" variant="outline">
                            +10
                          </Button>
                        </form>
                        <form action={toggleVariantActive}>
                          <input type="hidden" name="variantId" value={v.id} />
                          <Button size="sm" variant={v.isActive ? "outline" : "default"}>
                            {v.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {products.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No products — seed or create one.</p>}
    </div>
  );
}
