import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let addresses: any[] = [];
  if (userId) {
    try {
      addresses = await db.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    } catch {}
  }
  return <CheckoutForm addresses={addresses} />;
}
