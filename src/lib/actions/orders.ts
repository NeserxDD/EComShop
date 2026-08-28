"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Order state machine — COD: PENDING (created) → PAID (staff confirms) → SHIPPED → DELIVERED
// Also CANCELLED from PENDING/PAID. Mirrors repairs.ts transitions per shadcn.
const transitions: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || !["STAFF", "ADMIN"].includes(role)) throw new Error("Forbidden: STAFF/ADMIN only");

  const id = String(formData.get("id") || "");
  const toStatus = String(formData.get("toStatus") || "");
  const toPayment = String(formData.get("toPayment") || "") || null;

  const order = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) throw new Error("Order not found");

  const allowed = transitions[order.status] || [];
  if (!allowed.includes(toStatus)) throw new Error(`Invalid transition ${order.status} → ${toStatus}. Allowed: ${allowed.join(", ") || "none"}`);

  await db.order.update({
    where: { id },
    data: {
      status: toStatus as any,
      ...(toPayment ? { paymentStatus: toPayment as any } : {}),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
}
