"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await authClient.signUp.email(
      { name, email, password, phone: phone || undefined } as Record<string, unknown> as Parameters<typeof authClient.signUp.email>[0],
      {
        onSuccess: () => router.push("/"),
        onError: (ctx) => setError(ctx.error.message),
      }
    );
    if (res?.error) setError(res.error.message || "Failed");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="text-sm text-zinc-500">Role defaults to CUSTOMER. ADMIN promotes via DB.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          placeholder="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          placeholder="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          placeholder="phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input
          placeholder="password (min 8)"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={loading} className="w-full">
          {loading ? "Creating…" : "Sign up"}
        </Button>
        <p className="text-center text-xs text-zinc-500">
          Already have account? <a href="/sign-in" className="underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}
