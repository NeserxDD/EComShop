import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId) redirect("/sign-in");

  let order: any | null = null;
  try {
    order = await db.order.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { name: true, slug: true } } } }, user: { select: { email: true, name: true } } },
    });
  } catch {
    return <div className="p-8 text-sm text-zinc-500">DB not configured.</div>;
  }
  if (!order) notFound();
  // Only owner or ADMIN/STAFF can view
  if ((order as unknown as { userId: string }).userId !== userId && !["ADMIN", "STAFF"].includes(role || "")) redirect("/orders");

  const shipping = (order.shippingAddress as Record<string, string>) || {};
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-bold">Order {(order as unknown as { orderNo: string }).orderNo}</h1>
      <p className="text-xs rounded-full border inline-block px-2 py-1 mt-1 dark:border-zinc-800">
        {order.status} / {order.paymentStatus}
      </p>
      <div className="mt-4 rounded-2xl border p-4 dark:border-zinc-800">
        <p className="text-sm font-medium">Items</p>
        {(order.items as unknown as { product: { name: string }; qty: number; unitPrice: unknown }[]).map((it, i) => (
          <div key={i} className="flex justify-between py-2 text-sm border-t mt-2 dark:border-zinc-800">
            <span>
              {it.product.name} × {it.qty}
            </span>
            <span>{formatPrice(Number(it.unitPrice) * it.qty)}</span>
          </div>
        ))}
        <p className="mt-3 font-semibold">Total: {formatPrice(Number((order as unknown as { total: unknown }).total))}</p>
      </div>
      <div className="mt-4 rounded-2xl border p-4 text-sm dark:border-zinc-800">
        <p className="font-medium">Shipping</p>
        <p className="text-zinc-500">
          {shipping.street}, {shipping.city} • {shipping.phone}
        </p>
        <p className="text-xs text-zinc-500 mt-2">Payment: {(order.paymentMeta as Record<string, string>)?.method || "COD"}</p>
      </div>
    </div>
  );
}
