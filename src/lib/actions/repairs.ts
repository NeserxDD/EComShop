"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resend } from "@/lib/resend";
import { RepairStatusEmail } from "@/emails/repair-status";

// Vibecode learning: Repair state machine — never allow arbitrary jumps.
// - Valid transitions map ensures data integrity (e.g., can't go READY → RECEIVED).
// - Server validates transition; history logged atomically in transaction.
// - Keep transactions short per supabase-postgres-best-practices lock-short-transactions.

const transitions: Record<string, string[]> = {
  PENDING: ["RECEIVED", "CANCELLED"],
  RECEIVED: ["DIAGNOSING", "CANCELLED"],
  DIAGNOSING: ["WAITING_PARTS", "REPAIRING", "CANCELLED"],
  WAITING_PARTS: ["REPAIRING", "CANCELLED"],
  REPAIRING: ["TESTING", "CANCELLED"],
  TESTING: ["READY", "REPAIRING"], // can loop back if test fails
  READY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function createRepair(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/sign-in?next=/repairs/new");

  const deviceType = String(formData.get("deviceType") || "OTHER");
  const brand = String(formData.get("brand") || "") || null;
  const model = String(formData.get("model") || "") || null;
  const serialNo = String(formData.get("serialNo") || "") || null;
  const issueDescription = String(formData.get("issueDescription") || "").trim();
  const imagesRaw = String(formData.get("images") || "[]");
  const estimatedCost = formData.get("estimatedCost") ? parseFloat(String(formData.get("estimatedCost"))) : null;

  if (!issueDescription) throw new Error("Issue required");

  let images: string[] = [];
  try {
    const parsed = JSON.parse(imagesRaw);
    images = Array.isArray(parsed) ? parsed : imagesRaw ? [imagesRaw] : [];
  } catch {
    images = imagesRaw ? [imagesRaw] : [];
  }

  const ticketNo = `REP-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const job = await db.repairJob.create({
    data: {
      ticketNo,
      customerId: userId,
      deviceType: deviceType as any,
      brand,
      model,
      serialNo,
      issueDescription,
      images,
      status: "PENDING",
      estimatedCost: estimatedCost ?? undefined,
    },
  });

  await db.repairStatusHistory.create({
    data: { repairJobId: job.id, fromStatus: null, toStatus: "PENDING", changedById: userId, note: "Awaiting drop-off at Manila showroom" },
  });

  revalidatePath("/repairs/track");
  revalidatePath("/admin/repairs");
  redirect(`/repairs/track?ticket=${ticketNo}&created=1`);
}

export async function updateRepairStatus(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!role || !["STAFF", "ADMIN"].includes(role)) throw new Error("Forbidden: STAFF/ADMIN only");

  const id = String(formData.get("id") || "");
  const toStatus = String(formData.get("toStatus") || "");
  const note = String(formData.get("note") || "") || null;
  const finalCostRaw = formData.get("finalCost");
  const finalCost = finalCostRaw ? parseFloat(String(finalCostRaw)) : undefined;
  const assignedToId = String(formData.get("assignedToId") || "") || null;
  const partsRaw = String(formData.get("partsUsed") || "") || null;
  let partsUsed: unknown = undefined;
  if (partsRaw) {
    try {
      partsUsed = JSON.parse(partsRaw);
    } catch {
      partsUsed = partsRaw ? [partsRaw] : undefined;
    }
  }

  const job = await db.repairJob.findUnique({
    where: { id },
    select: { status: true, ticketNo: true, customerId: true, brand: true, model: true, deviceType: true },
  });
  if (!job) throw new Error("Repair not found");

  // Allow updating assign/parts without status change; if status same, skip transition check
  const isStatusChange = toStatus && toStatus !== job.status;
  if (isStatusChange) {
    const allowed = transitions[job.status] || [];
    if (!allowed.includes(toStatus)) throw new Error(`Invalid transition ${job.status} → ${toStatus}. Allowed: ${allowed.join(", ") || "none"}`);
  }

  // Handle parts inventory (optional): if partsUsed is array of {productId, variantId?, qty}, decrement stock
  let partsForInventory: { productId: string; variantId?: string | null; qty: number }[] = [];
  if (Array.isArray(partsUsed)) {
    for (const p of partsUsed as any[]) {
      if (p && typeof p === "object" && p.productId) {
        partsForInventory.push({ productId: String(p.productId), variantId: p.variantId ? String(p.variantId) : null, qty: Number(p.qty) || 1 });
      } else if (typeof p === "string" && p.includes("::")) {
        // Format "productId::variantId::qty" from dropdown
        const [productId, variantId, qtyStr] = p.split("::");
        if (productId) partsForInventory.push({ productId, variantId: variantId || null, qty: Number(qtyStr) || 1 });
      }
    }
  }

  await db.$transaction(async (tx) => {
    await tx.repairJob.update({
      where: { id },
      data: {
        ...(isStatusChange ? { status: toStatus as any } : {}),
        ...(finalCost !== undefined ? { finalCost } : {}),
        ...(assignedToId !== null ? { assignedToId: assignedToId || null } : {}),
        ...(partsUsed !== undefined ? { partsUsed: partsUsed as any } : {}),
      },
    });
    if (isStatusChange) {
      await tx.repairStatusHistory.create({
        data: { repairJobId: id, fromStatus: job.status as any, toStatus: toStatus as any, changedById: userId || undefined, note },
      });
    }
    // Decrement inventory for each part used (optional, only if linked to ProductVariant/Product)
    for (const part of partsForInventory) {
      if (part.variantId) {
        const v: any = await (tx as any).productVariant.findUnique({ where: { id: part.variantId }, select: { stockQty: true } });
        if (v && v.stockQty >= part.qty) {
          await (tx as any).productVariant.update({ where: { id: part.variantId }, data: { stockQty: { decrement: part.qty } } });
          await tx.product.update({ where: { id: part.productId }, data: { stockQty: { decrement: part.qty } } });
          await tx.inventoryLog.create({
            data: { productId: part.productId, variantId: part.variantId, change: -part.qty, reason: "REPAIR_USE", note: `Repair ${job.ticketNo} used ${part.qty}× ${part.variantId}` },
          });
        }
      } else {
        const prod: any = await tx.product.findUnique({ where: { id: part.productId }, select: { stockQty: true } });
        if (prod && prod.stockQty >= part.qty) {
          await tx.product.update({ where: { id: part.productId }, data: { stockQty: { decrement: part.qty } } });
          await tx.inventoryLog.create({
            data: { productId: part.productId, change: -part.qty, reason: "REPAIR_USE", note: `Repair ${job.ticketNo}` },
          });
        }
      }
    }
  });

  // Resend A: admin → customer (no Gmail needed, To = customer.email like customer@demo.test, From = onboarding@resend.dev)
  if (isStatusChange && resend) {
    const customer = await db.user.findUnique({ where: { id: job.customerId }, select: { email: true, name: true } });
    if (customer?.email) {
      const device = `${job.deviceType} ${job.brand || ""} ${job.model || ""}`.trim();
      const toSend = resend;
      after(async () => {
        try {
          await toSend.emails.send({
            from: "Stone & Circuit <onboarding@resend.dev>",
            to: customer.email,
            subject: `Repair ${job.ticketNo} → ${toStatus}`,
            react: RepairStatusEmail({
              ticketNo: job.ticketNo,
              customerName: customer.name || "Customer",
              device: device || "Device",
              oldStatus: job.status,
              newStatus: toStatus,
              note,
            }) as any,
          });
        } catch (e) {
          console.error("Resend repair status failed", e);
        }
      });
    }
  }

  revalidatePath("/repairs/track");
  revalidatePath("/admin/repairs");
  revalidatePath(`/repairs/track?ticket=${job.ticketNo}`);
}
