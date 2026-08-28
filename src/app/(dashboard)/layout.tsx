import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

// Vibecode learning: Dashboard guard.
// - Server Component layout runs before children → redirect if not ADMIN/STAFF.
// - No client flash: auth check on server, then stream. Pattern from nextjs-app-router-patterns: server-auth-actions.
// - CUSTOMER hitting /admin is redirected to /sign-in (could also show 403).

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ok, role } = await requireRole(["STAFF", "ADMIN"]);
  if (!ok) {
    // Preserve learning: unauthenticated users see sign-in; authenticated CUSTOMER could see upgrade message.
    // For MVP, simple redirect.
    redirect("/sign-in?next=/admin&reason=role:" + (role || "none"));
  }
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-black dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-mono uppercase tracking-widest text-zinc-500">
            Dashboard • {role}
          </span>
          <a href="/" className="text-xs underline">
            ← Back to store
          </a>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
    </div>
  );
}
