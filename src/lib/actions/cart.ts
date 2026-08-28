"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Vibecode learning: Cart checkout as Server Action.
// - Client cart is in localStorage (see cart context). On checkout we POST JSON to this action via form or fetch.
// - This action runs on server: validates stock, creates Order + OrderItems in a transaction, decrements stock, logs Inventory.
// - No Stripe yet — COD creates Order status PENDING, paymentStatus PENDING.
// - Uses Prisma $transaction for atomicity — free tier safe (short transaction per supabase-postgres-best-practices lock-short-transactions).

type CartItem = { productId: string; qty: number };

export async function checkoutCOD(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/sign-in?next=/checkout");

  const cartRaw = String(formData.get("cart") || "[]");
  const shippingRaw = String(formData.get("shippingAddress") || "{}");
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartRaw);
  } catch {
    throw new Error("Invalid cart");
  }
  if (!cart.length) throw new Error("Cart empty");

  const shipping = JSON.parse(shippingRaw || "{}") as { street?: string; city?: string; phone?: string };

  // Fetch products with lock-friendly short transaction
  const productIds = cart.map((c) => c.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, price: true, stockQty: true, name: true },
  });

  const map = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  for (const item of cart) {
    const p = map.get(item.productId);
    if (!p) throw new Error(`Product not found: ${item.productId}`);
    if (p.stockQty < item.qty) throw new Error(`Insufficient stock for ${p.name}: ${p.stockQty} left`);
    total += Number(p.price) * item.qty;
  }

  const orderNo = `ECOM-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNo,
        userId,
        total,
        shippingAddress: shipping,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMeta: { method: "COD" },
      },
    });

    for (const item of cart) {
      const p = map.get(item.productId)!;
      await tx.orderItem.create({
        data: {
          orderId: created.id,
          productId: item.productId,
          qty: item.qty,
          unitPrice: p.price,
        },
      });
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.qty } },
      });
      await tx.inventoryLog.create({
        data: { productId: item.productId, change: -item.qty, reason: "SALE", note: `Order ${orderNo}` },
      });
      // Low stock could trigger Resend later (Phase 4)
      if (updated.stockQty <= updated.lowStockThreshold) {
        console.warn(`[LOW STOCK] ${p.name} = ${updated.stockQty}`);
      }
    }

    return created;
  });

  redirect(`/orders/${order.id}?success=1`);
}
