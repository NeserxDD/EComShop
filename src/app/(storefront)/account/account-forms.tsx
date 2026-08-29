"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function ProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
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
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <h2 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
        Profile
      </h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button type="submit">Save profile</Button>
    </form>
  );
}

export function EmailForm({ initialEmail }: { initialEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    // Better Auth changeEmail: verify new email (standard) + FYI old is automatic
    const res = await (authClient as any).changeEmail({ newEmail, callbackURL: "/" });
    if ((res as any)?.error) setErr((res as any).error.message || "Failed — check new email");
    else setMsg(`Verification sent to ${newEmail} ✓ Check inbox to confirm. Old email ${initialEmail} will get FYI.`);
  }
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <h2 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
        Change email
      </h2>
      <p className="text-xs text-muted-foreground">Current: {initialEmail} — new email will be verified (new-only + FYI old, standard).</p>
      <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email" type="email" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button type="submit">Send verification</Button>
    </form>
  );
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true } as any);
    if ((res as any)?.error) setErr((res as any).error.message || "Failed — check current password");
    else {
      setMsg("Password changed ✓ — other sessions revoked");
      setCurrentPassword("");
      setNewPassword("");
    }
  }
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <h2 className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
        Change password
      </h2>
      <p className="text-xs text-muted-foreground">Old password is required for your own account.</p>
      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 8)" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button type="submit">Change password</Button>
    </form>
  );
}

export function DeleteForm({ email }: { email: string }) {
  const router = useRouter();
  const [deletePassword, setDeletePassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!confirm(`Delete your account ${email}? This will anonymize your profile but keep your orders for records. This cannot be undone.`)) return;
    const res = await (authClient as any).deleteUser({ password: deletePassword });
    if ((res as any)?.error) setErr((res as any).error.message || "Delete failed — if you have orders, contact admin to anonymize.");
    else {
      setTimeout(() => router.push("/"), 1000);
    }
  }
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-red-200 bg-card p-4 shadow-sm space-y-3 dark:border-red-900">
      <h2 className="font-medium text-red-700 dark:text-red-300">Danger zone</h2>
      <p className="text-xs text-muted-foreground">Delete will soft-anonymize (keep orders, anonymize name/email) — not hard delete.</p>
      <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter current password to confirm" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button variant="destructive" type="submit">
        Delete my account
      </Button>
    </form>
  );
}
