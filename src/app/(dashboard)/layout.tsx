import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";

// Dashboard — warm stone + amber, sidebar at ≥1024px per skill (storefront kept top bar for conversion)
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ok, role } = await requireRole(["STAFF", "ADMIN"]);
  if (!ok) {
    redirect("/sign-in?next=/admin&reason=role:" + (role || "none"));
  }
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar — 14rem fixed, hairline dividers per bryl идею but warm */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-card sticky top-0 h-screen">
        <div className="h-14 flex items-center px-5 border-b border-border gap-2">
          <span className="size-6 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-bold">E</span>
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-inter)" }}>
            Dashboard
          </span>
          <span className="ml-auto text-[10px] font-mono uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {role}
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: "/admin", label: "Overview" },
            { href: "/admin/products", label: "Products" },
            { href: "/admin/orders", label: "Orders" },
            { href: "/admin/repairs", label: "Repairs" },
            { href: "/admin/customers", label: "Customers" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <span className="text-muted-foreground">›</span> {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border flex items-center justify-between">
          <Link href="/" className="text-xs hover:underline">
            ← Store
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top + content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4">
          <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Dashboard • {role}</span>
          <div className="flex gap-2">
            <Link href="/" className="text-xs underline">
              Store
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto max-w-6xl w-full px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
