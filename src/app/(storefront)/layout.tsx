import Link from "next/link";
import { getSession } from "@/lib/session";

// Vibecode learning: Route Group layout (storefront).
// - Folder name (storefront) is ignored in URL — /products still works, but shares this layout.
// - Server Component: getSession() here → no client fetch, no waterfall per vercel-react-best-practices async-parallel.
// - Header is same across public site, separate from (dashboard) layout.

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user as { name?: string; role?: string } | undefined;
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-black/80 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6">
          <Link href="/" className="font-bold tracking-tight">
            EComShop
          </Link>
          <nav className="hidden gap-6 text-sm sm:flex">
            <Link href="/products" className="hover:underline">
              Products
            </Link>
            <Link href="/repairs/new" className="hover:underline">
              Repair
            </Link>
            <Link href="/repairs/track" className="hover:underline">
              Track
            </Link>
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden sm:inline text-zinc-500">
                  {user.name} ({user.role})
                </span>
                <Link
                  href="/api/auth/sign-out"
                  className="rounded-full border px-3 py-1.5 text-xs hover:bg-zinc-50 dark:border-zinc-800"
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm hover:underline">
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-black px-4 py-1.5 text-xs text-white dark:bg-white dark:text-black"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        $0 Stack — Supabase Free + Cloudinary Free + Vercel Hobby + Better Auth
      </footer>
    </div>
  );
}
