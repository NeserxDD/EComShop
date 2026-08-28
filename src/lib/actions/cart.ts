"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Vibecode learning: Cart checkout as Server Action.
// - Client cart is in localStorage (see cart context). On checkout we POST JSON to this action via form or fetch.
// - This action runs on server: validates stock, creates Order + OrderItems in a transaction, decrements stock, logs Inventory.
// - No Stripe yet — COD creates Order status PENDING, paymentStatus PENDING.
// - Uses Prisma $transaction for atomicity — free tier safe (short transaction per supabase-postgres-best-practices lock-short-transactions).

type CartItem = { productId: string; variantId?: string | null; qty: number };

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

  // Fetch products + variants with lock-friendly short transaction
  const productIds = [...new Set(cart.map((c) => c.productId))];
  const variantIds = [...new Set(cart.map((c) => c.variantId).filter(Boolean) as string[])];
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, price: true, stockQty: true, name: true },
  });
  const variants = variantIds.length
    ? await (db as any).productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        select: { id: true, price: true, stockQty: true, sku: true, label: true, productId: true },
      })
    : [];

  const pMap = new Map(products.map((p) => [p.id, p]));
  const vMap = new Map(variants.map((v: any) => [v.id, v]));
  let total = 0;
  for (const item of cart) {
    if (item.variantId) {
      const v: any = vMap.get(item.variantId);
      if (!v) throw new Error(`Variant not found: ${item.variantId}`);
      if (v.stockQty < item.qty) throw new Error(`Insufficient stock for variant ${v.label}: ${v.stockQty} left`);
      total += Number(v.price) * item.qty;
    } else {
      const p = pMap.get(item.productId);
      if (!p) throw new Error(`Product not found: ${item.productId}`);
      if (p.stockQty < item.qty) throw new Error(`Insufficient stock for ${p.name}: ${p.stockQty} left`);
      total += Number(p.price) * item.qty;
    }
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
      if (item.variantId) {
        const v: any = vMap.get(item.variantId)!;
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: item.productId,
            variantId: item.variantId,
            qty: item.qty,
            unitPrice: v.price,
          },
        });
        const updatedV: any = await (tx as any).productVariant.update({
          where: { id: item.variantId },
          data: { stockQty: { decrement: item.qty } },
        });
        // Also decrement parent stock to keep sum consistent
        await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.qty } } });
        await tx.inventoryLog.create({
          data: { productId: item.productId, variantId: item.variantId, change: -item.qty, reason: "SALE", note: `Order ${orderNo} variant ${v.label}` },
        });
        if (updatedV.stockQty <= updatedV.lowStockThreshold) {
          console.warn(`[LOW STOCK] Variant ${v.label} = ${updatedV.stockQty}`);
        }
      } else {
        const p = pMap.get(item.productId)!;
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: item.productId,
            qty: item.qty,
            unitPrice: p!.price,
          },
        });
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        });
        await tx.inventoryLog.create({
          data: { productId: item.productId, change: -item.qty, reason: "SALE", note: `Order ${orderNo}` },
        });
        if (updated.stockQty <= updated.lowStockThreshold) {
          console.warn(`[LOW STOCK] ${p!.name} = ${updated.stockQty}`);
        }
      }
    }

    return created;
  });

  redirect(`/orders/${order.id}?success=1`);
}
