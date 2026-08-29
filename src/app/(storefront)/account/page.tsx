import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ProfileForm, EmailForm, PasswordForm, DeleteForm } from "./account-forms";
import { AddressBook } from "./address-book";

export default async function AccountPage() {
  const session = await getSession();
  const user = session?.user as { id?: string; name?: string; email?: string; phone?: string; role?: string } | undefined;
  if (!user?.id) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12 text-center">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
          Account
        </h1>
        <p className="text-sm text-muted-foreground">Please sign in.</p>
        <a href="/sign-in" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
          Sign in
        </a>
      </div>
    );
  }

  let addresses: any[] = [];
  try {
    addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  } catch {
    addresses = [];
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
          My Account
        </h1>
        <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          {user.email} · {user.role}
        </p>
      </div>

      <ProfileForm initialName={user.name || ""} initialPhone={(user as any).phone || ""} />
      <AddressBook initialAddresses={addresses} />
      <EmailForm initialEmail={user.email || ""} />
      <PasswordForm />
      <DeleteForm email={user.email || ""} />

      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
        Warm stone · Stone & Circuit · Manila · Soft delete keeps orders, anonymize name/email, banned true
      </p>
    </div>
  );
}
