"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Only ADMIN can promote — STAFF cannot elevate.
export async function updateCustomerRole(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");

  const userId = String(formData.get("userId") || "");
  const toRole = String(formData.get("toRole") || "") as "CUSTOMER" | "STAFF" | "ADMIN";
  if (!["CUSTOMER", "STAFF", "ADMIN"].includes(toRole)) throw new Error("Invalid role");

  // Prevent self-demotion lockout? Allow but warn — keep simple for demo.
  await db.user.update({ where: { id: userId }, data: { role: toRole } });

  revalidatePath("/admin/customers");
}
