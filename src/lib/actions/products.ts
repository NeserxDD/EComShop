"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/utils";

// Vibecode learning: Server Actions = form handlers that run on server, no API route needed.
// - "use server" marks file as server-only — never shipped to browser (secrets safe).
// - Called directly from <form action={createProduct}> — progressive enhancement (works without JS).
// - We guard with requireRole here too — even if UI hides button, server re-checks.

function assertAdmin(role?: string) {
  if (role !== "ADMIN") throw new Error("Forbidden: ADMIN only");
}

export async function createProduct(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  assertAdmin(role);

  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const price = parseFloat(String(formData.get("price") || "0"));
  const stockQty = parseInt(String(formData.get("stockQty") || "0"), 10);
  const categoryId = String(formData.get("categoryId") || "");
  const description = String(formData.get("description") || "");
  const imagesRaw = String(formData.get("images") || "[]"); // JSON array string or single URL
  const imageFile = formData.get("imageFile") as File | null;

  if (!name || !sku || !categoryId) throw new Error("Missing fields");

  let images: string[] = [];
  try {
    const parsed = JSON.parse(imagesRaw);
    images = Array.isArray(parsed) ? parsed : [imagesRaw].filter(Boolean);
  } catch {
    images = imagesRaw ? [imagesRaw] : [];
  }

  // Cloudinary upload for warm stone portfolio — if file provided, upload and prepend URL
  if (imageFile && imageFile.size > 0) {
    try {
      const { cloudinary } = await import("@/lib/cloudinary");
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
      const uploaded: any = await cloudinary.uploader.upload(base64, {
        folder: "stone-and-circuit/products",
        resource_type: "image",
      });
      if (uploaded?.secure_url) images.unshift(uploaded.secure_url);
    } catch (e) {
      console.error("Cloudinary upload failed, using URL fallback", e);
    }
  }

  const slug = `${slugify(name)}-${Date.now().toString(36).slice(-4)}`;

  const product = await db.product.create({
    data: {
      name,
      slug,
      sku,
      price,
      stockQty: isNaN(stockQty) ? 0 : stockQty,
      categoryId,
      description,
      images,
    },
  });

  await db.inventoryLog.create({
    data: { productId: product.id, change: product.stockQty, reason: "INITIAL", note: "Created via admin" },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductStock(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || !["STAFF", "ADMIN"].includes(role)) throw new Error("Forbidden");

  const id = String(formData.get("id") || "");
  const delta = parseInt(String(formData.get("delta") || "0"), 10); // e.g., +5 or -2
  const reason = (String(formData.get("reason") || "ADJUSTMENT") as "RESTOCK" | "ADJUSTMENT") || "ADJUSTMENT";

  const product = await db.product.update({
    where: { id },
    data: { stockQty: { increment: delta } },
  });

  await db.inventoryLog.create({
    data: { productId: id, change: delta, reason, note: `Adjusted by ${role}` },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
}

export async function toggleProductActive(formData: FormData) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  assertAdmin(role);
  const id = String(formData.get("id") || "");
  const current = await db.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!current) throw new Error("Not found");
  await db.product.update({ where: { id }, data: { isActive: !current.isActive } });
  revalidatePath("/products");
  revalidatePath("/admin/products");
}
