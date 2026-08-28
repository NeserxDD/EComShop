import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Warm stone table — hairline stone-200, mono labels per shadcn
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ low?: string }>;
}) {
  const { low } = await searchParams;
  const showLowOnly = low === "1";

  let logs: any[] = [];
  let lowProducts: any[] = [];
  try {
    // Recent 50 logs
    logs = await db.inventoryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: { select: { name: true, sku: true, stockQty: true, lowStockThreshold: true } } },
    });
    // Low-stock products
    lowProducts = await db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, stockQty: true, lowStockThreshold: true, category: { select: { name: true } } },
    });
    lowProducts = lowProducts.filter((p: any) => p.stockQty <= p.lowStockThreshold);
    if (showLowOnly) logs = logs.filter((l: any) => l.product.stockQty <= l.product.lowStockThreshold);
  } catch {
    return <div className="text-sm text-muted-foreground">DB not configured — run migrate & seed.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
            Inventory Logs — {logs.length}
          </h1>
          <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
            {lowProducts.length} LOW STOCK · Warm stone · {showLowOnly ? "Filtered low only" : "Last 50 movements"}
          </p>
        </div>
        <Link
          href={showLowOnly ? "/admin/inventory" : "/admin/inventory?low=1"}
          className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
        >
          {showLowOnly ? "Show all" : `Show low only (${lowProducts.length})`}
        </Link>
      </div>

      {lowProducts.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Low stock alerts — {lowProducts.length} items</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowProducts.map((p: any) => (
              <span key={p.id} className="rounded-full border border-amber-300 bg-white px-2 py-1 text-xs dark:border-amber-800 dark:bg-stone-900">
                {p.name} · {p.stockQty} left (threshold {p.lowStockThreshold})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs font-mono uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-center">Change</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Note</th>
              <th className="p-3 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l: any) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3">
                  <div className="font-medium">{l.product.name}</div>
                  <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                    {l.product.sku} · Stock {l.product.stockQty}
                  </div>
                </td>
                <td className={`p-3 text-center font-mono ${l.change > 0 ? "text-green-600" : l.change < 0 ? "text-red-600" : ""}`}>
                  {l.change > 0 ? `+${l.change}` : l.change}
                </td>
                <td className="p-3">
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs">{l.reason}</span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{l.note || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No logs yet — seed creates INITIAL, sales create SALE.</p>}
    </div>
  );
}
