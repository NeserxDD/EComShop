import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { email: true, name: true } }, items: { include: { product: { select: { name: true } } } } },
    });
  } catch {
    return <div className="text-sm text-zinc-500">DB not configured.</div>;
  }
  return (
    <div>
      <h1 className="text-xl font-bold">Orders — {orders.length}</h1>
      <p className="text-xs text-zinc-500">COD orders are PENDING → update to PAID/SHIPPED/DELIVERED via future Server Action.</p>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border p-4 dark:border-zinc-800">
            <div className="flex justify-between">
              <span className="font-mono text-xs">{o.orderNo}</span>
              <span className="text-xs rounded-full border px-2 py-0.5 dark:border-zinc-800">
                {o.status} / {o.paymentStatus}
              </span>
            </div>
            <p className="text-sm">
              {(o as unknown as { user: { name: string; email: string } }).user?.name} • {formatPrice(Number((o as unknown as { total: unknown }).total))}
            </p>
            <p className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString()} • {(o.items as unknown[]).length} items</p>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-zinc-500">No orders yet — checkout from /cart.</p>}
      </div>
    </div>
  );
}
