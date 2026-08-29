"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

// Vibecode learning: Client Component for auth form.
// - better-auth/react uses useState + authClient.signIn.email()
// - No Server Action here — Better Auth handles password hashing server-side via /api/auth/*
// - useSearchParams reads ?next= for post-login redirect.

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await authClient.signIn.email(
      { email, password },
      {
        onSuccess: async () => {
          router.refresh();
          // Role-aware redirect: ADMIN/STAFF → /admin (portfolio clear), CUSTOMER → next or /
          try {
            const s = await authClient.getSession();
            const role = (s?.data?.user as any)?.role;
            if (role === "ADMIN" || role === "STAFF") {
              router.push(next !== "/" ? next : "/admin");
            } else {
              router.push(next);
            }
            router.refresh();
          } catch {
            router.push(next);
            router.refresh();
          }
        },
        onError: (ctx) => setError(ctx.error.message),
      }
    );
    if (res?.error) setError(res.error.message || "Failed");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="text-sm text-zinc-500">Better Auth + Prisma (free, unlimited users)</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          placeholder="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          placeholder="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-zinc-500">
          No account? <a href="/sign-up" className="underline">Sign up</a>
        </p>
      </form>
    </div>
  );
}
