"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ProfileDropdown({ user }: { user: { name?: string; email?: string; role?: string; image?: string | null } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (user.name?.[0] || user.email?.[0] || "U").toUpperCase();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function onSignOut() {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name || "Profile"} className="size-8 rounded-full object-cover" />
        ) : (
          initial
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-[0_12px_32px_rgba(28,25,23,0.12)] z-50">
          <div className="px-3 py-2 border-b border-border mb-2">
            <p className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-inter)" }}>
              {user.name}
            </p>
            <p className="text-xs font-mono truncate text-muted-foreground">
              {user.email} · {user.role}
            </p>
          </div>
          <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
            <span>👤</span> Account
          </Link>
          <Link href="/account#password" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
            <span>⚙️</span> Settings
          </Link>
          <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors lg:hidden">
            <span>📦</span> Orders
          </Link>
          <Link href="/repairs/my" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors lg:hidden">
            <span>🔧</span> My Repairs
          </Link>
          <div className="border-t border-border my-2" />
          <button
            onClick={onSignOut}
            disabled={loading}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors text-left disabled:opacity-50"
          >
            <span>↗</span> {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
