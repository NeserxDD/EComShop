"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function createAddress(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Not signed in");

  const label = String(formData.get("label") || "Home").trim() || "Home";
  const street = String(formData.get("street") || "").trim();
  const barangay = String(formData.get("barangay") || "").trim() || null;
  const city = String(formData.get("city") || "").trim();
  const province = String(formData.get("province") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const zip = String(formData.get("zip") || "").trim();
  const country = String(formData.get("country") || "PH").trim() || "PH";
  const isDefault = formData.get("isDefault") === "on" || formData.get("isDefault") === "true";

  if (!street || !city || !province || !region || !zip) throw new Error("Missing address fields");

  if (isDefault) {
    await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  await db.address.create({
    data: { userId, label, street, barangay, city, province, region, zip, country, isDefault: isDefault || false },
  });

  revalidatePath("/account");
  revalidatePath("/checkout");
}

export async function updateAddress(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Not signed in");
  const id = String(formData.get("id") || "");
  const label = String(formData.get("label") || "").trim();
  const street = String(formData.get("street") || "").trim();
  const barangay = String(formData.get("barangay") || "").trim() || null;
  const city = String(formData.get("city") || "").trim();
  const province = String(formData.get("province") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const zip = String(formData.get("zip") || "").trim();
  const isDefault = formData.get("isDefault") === "on" || formData.get("isDefault") === "true";

  const existing = await db.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Address not found");

  if (isDefault) await db.address.updateMany({ where: { userId }, data: { isDefault: false } });

  await db.address.update({
    where: { id },
    data: { label, street, barangay, city, province, region, zip, isDefault: isDefault || false },
  });

  revalidatePath("/account");
  revalidatePath("/checkout");
}

export async function deleteAddress(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Not signed in");
  const id = String(formData.get("id") || "");
  const existing = await db.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Address not found");
  await db.address.delete({ where: { id } });
  revalidatePath("/account");
  revalidatePath("/checkout");
}

export async function setDefaultAddress(formData: FormData) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Not signed in");
  const id = String(formData.get("id") || "");
  await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await db.address.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/account");
  revalidatePath("/checkout");
}
