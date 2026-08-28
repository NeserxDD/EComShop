import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/sign-in?next=/orders");

  let orders: any[] = [];
  try {
    orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true, slug: true } } } } },
    });
  } catch {
    return <div className="mx-auto max-w-2xl px-6 py-8 text-sm text-zinc-500">DB not configured.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold">My Orders — {orders.length}</h1>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="block rounded-2xl border p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <div className="flex justify-between">
              <span className="font-mono text-xs">{o.orderNo}</span>
              <span className="text-xs rounded-full border px-2 py-0.5">{o.status}</span>
            </div>
            <p className="text-sm">{formatPrice(Number((o as unknown as { total: unknown }).total))} • {(o.items as unknown[]).length} items</p>
            <p className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString()}</p>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-sm text-zinc-500">No orders — buy from /products then checkout COD.</p>}
      </div>
    </div>
  );
}
