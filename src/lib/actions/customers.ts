"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { hashPassword } from "@better-auth/utils/password";

// Only ADMIN can promote — STAFF cannot elevate.
export async function updateCustomerRole(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");

  const userId = String(formData.get("userId") || "");
  const toRole = String(formData.get("toRole") || "") as "CUSTOMER" | "STAFF" | "ADMIN";
  if (!["CUSTOMER", "STAFF", "ADMIN"].includes(toRole)) throw new Error("Invalid role");

  await db.user.update({ where: { id: userId }, data: { role: toRole } });
  revalidatePath("/admin/customers");
}

// Admin modify others: name/phone — self-service is via /account, admin can edit any
export async function adminUpdateUser(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");
  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  if (!userId || !name) throw new Error("Missing fields");
  await db.user.update({ where: { id: userId }, data: { name, phone } });
  revalidatePath("/admin/customers");
}

// Admin set password for others — NO old password needed (per your approval)
export async function adminSetPassword(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");
  const userId = String(formData.get("userId") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (!userId || !newPassword || newPassword.length < 8) throw new Error("Password min 8");
  const hash = await hashPassword(newPassword);
  // Better Auth credential issuer is local:credential
  await db.account.updateMany({
    where: { userId, providerId: "credential" },
    data: { password: hash },
  });
  revalidatePath("/admin/customers");
}

// Soft delete / anonymize — keeps orders/repairs (RESTRICT FK), bans login
export async function anonymizeUser(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const currentId = (session?.user as { id?: string } | undefined)?.id;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");
  const userId = String(formData.get("userId") || "");
  if (!userId) throw new Error("Missing userId");
  if (userId === currentId) throw new Error("Admin cannot delete self via admin panel — use /account Danger zone");
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) throw new Error("User not found");
  // Optional: check has orders/repairs — we soft delete anyway (keep them)
  await db.user.update({
    where: { id: userId },
    data: {
      name: "Deleted User",
      email: `deleted+${userId.slice(0, 8)}@stoneandcircuit.test`,
      phone: null,
      banned: true,
      banReason: "Anonymized by admin — soft delete",
      banExpires: null,
    },
  });
  // Revoke sessions
  await db.session.deleteMany({ where: { userId } });
  revalidatePath("/admin/customers");
}

export async function banUser(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");
  const userId = String(formData.get("userId") || "");
  const reason = String(formData.get("reason") || "Banned by admin") || "Banned by admin";
  await db.user.update({ where: { id: userId }, data: { banned: true, banReason: reason } });
  await db.session.deleteMany({ where: { userId } });
  revalidatePath("/admin/customers");
}

export async function unbanUser(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");
  const userId = String(formData.get("userId") || "");
  await db.user.update({ where: { id: userId }, data: { banned: false, banReason: null, banExpires: null } });
  revalidatePath("/admin/customers");
}
