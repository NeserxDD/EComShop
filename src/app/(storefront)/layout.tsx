import Link from "next/link";
import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";

// Warm stone + amber — anthropics frontend-design (thesis hero) + shadcn + vercel web-guidelines
// Header: sticky hairline (stone-200) 1px, 90% bg + backdrop-blur, micro mono labels, not plain.

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user as { name?: string; role?: string } | undefined;
  const isStaff = user && ["STAFF", "ADMIN"].includes(user.role || "");
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6 gap-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="size-6 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-bold">S</span>
              <span className="font-bold tracking-tight text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                Stone & Circuit
              </span>
              <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                EST. 2026
              </span>
            </Link>
            <nav className="hidden gap-1 text-sm sm:flex">
              {[
                { href: "/products", label: "Products" },
                { href: "/repairs/new", label: "Repair" },
                { href: "/repairs/track", label: "Track" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 rounded-full hover:bg-muted text-sm transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              {isStaff && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Admin
                </Link>
              )}
              {user && !isStaff && (
                <>
                  <Link href="/orders" className="px-3 py-1.5 rounded-full hover:bg-muted text-sm transition-colors">
                    Orders
                  </Link>
                  <Link href="/repairs/my" className="px-3 py-1.5 rounded-full hover:bg-muted text-sm transition-colors">
                    My Repairs
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden lg:inline text-xs font-mono uppercase tracking-wide text-muted-foreground">
                  {user.name} · {user.role}
                </span>
                <Link
                  href="/api/auth/sign-out"
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="hidden sm:inline text-sm hover:underline px-2">
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-wrap justify-between gap-4 text-xs">
          <p className="font-mono uppercase tracking-wide text-muted-foreground">© 2026 Stone & Circuit · Manila · Mon–Sat 9am–6pm</p>
          <p className="text-muted-foreground">
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>{" "}
            ·{" "}
            <Link href="/products" className="hover:underline">
              Shipping
            </Link>{" "}
            · Warranty · Repair Policy
          </p>
        </div>
      </footer>
    </div>
  );
}
