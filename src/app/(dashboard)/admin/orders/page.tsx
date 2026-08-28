import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";

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
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        Orders — {orders.length}
      </h1>
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
        COD: PENDING → PAID → SHIPPED → DELIVERED · STAFF/ADMIN can update
      </p>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex justify-between">
              <span className="font-mono text-xs">{o.orderNo}</span>
              <span className="text-xs rounded-full border border-border bg-card px-2 py-0.5">
                {o.status} / {o.paymentStatus}
              </span>
            </div>
            <p className="text-sm">
              {(o as unknown as { user: { name: string; email: string } }).user?.name} · {formatPrice(Number((o as unknown as { total: unknown }).total))}
            </p>
            <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()} · {(o.items as unknown[]).length} items</p>
            <form action={updateOrderStatus} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={o.id} />
              <select name="toStatus" defaultValue={o.status} className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs">
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <select name="toPayment" defaultValue={o.paymentStatus} className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs">
                <option value="">— payment —</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
              <Button size="sm" type="submit">
                Update
              </Button>
            </form>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet — checkout from /cart.</p>}
      </div>
    </div>
  );
}
