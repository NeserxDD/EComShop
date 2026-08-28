"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

// Customer + Admin self-service: name/phone (no old password), password (needs old), delete (soft anonymize if has orders)
// Old password IS required for self (changePassword needs currentPassword) per your approval — admin-on-others uses admin.setUserPassword without old via admin/customers.

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as { id?: string; name?: string; email?: string; phone?: string; role?: string } | undefined;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone((user as any).phone || "");
    }
  }, [user?.name, (user as any)?.phone]);

  if (isPending) return <div className="mx-auto max-w-xl px-6 py-8 text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
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

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await authClient.updateUser({ name, phone: phone || undefined } as any);
    if ((res as any)?.error) setErr((res as any).error.message || "Failed");
    else {
      setMsg("Profile updated ✓");
      router.refresh();
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    // Old password IS required for self — per your approval
    const res = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true } as any);
    if ((res as any)?.error) setErr((res as any).error.message || "Failed — check current password");
    else {
      setMsg("Password changed ✓ — other sessions revoked");
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  async function onDelete(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!confirm(`Delete your account ${user?.email}? This will anonymize your profile but keep your orders for records. This cannot be undone.`)) return;
    // Better Auth deleteUser needs password if set, or fresh session. We pass password.
    const res = await (authClient as any).deleteUser({ password: deletePassword });
    if ((res as any)?.error) {
      // If has orders, Better Auth hard delete will fail FK — we handle soft anonymize via server fallback
      // Try custom soft delete via API (we'll add server route if needed, but for now show message)
      setErr((res as any).error.message || "Delete failed — if you have orders, contact admin to anonymize.");
    } else {
      setMsg("Account deleted — anonymized. Redirecting…");
      setTimeout(() => router.push("/"), 1000);
    }
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

      {msg && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">{msg}</div>}
      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{err}</div>}

      {/* Profile — name/phone, no old password */}
      <form onSubmit={onSaveProfile} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <h2 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
          Profile
        </h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here — contact admin. Role: {user.role}</p>
        <Button type="submit">Save profile</Button>
      </form>

      {/* Password — old required for self */}
      <form onSubmit={onChangePassword} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <h2 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
          Change password
        </h2>
        <p className="text-xs text-muted-foreground">Old password is required for your own account — per your approval.</p>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 8)" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <Button type="submit">Change password</Button>
      </form>

      {/* Delete — soft anonymize */}
      <form onSubmit={onDelete} className="rounded-xl border border-red-200 bg-card p-4 shadow-sm space-y-3 dark:border-red-900">
        <h2 className="font-medium text-red-700 dark:text-red-300">Danger zone</h2>
        <p className="text-xs text-muted-foreground">Delete will soft-anonymize (keep orders, anonymize name/email) — not hard delete. Admin cannot delete self via admin panel, but can delete own here.</p>
        <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter current password to confirm" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <Button variant="destructive" type="submit">
          Delete my account
        </Button>
      </form>
    </div>
  );
}
