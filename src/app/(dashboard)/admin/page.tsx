import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold">Staff / Admin Dashboard</h1>
      <p className="text-sm text-zinc-500">Phase 1: Better Auth RBAC gate (ADMIN/STAFF only). Phase 2-3: CRUD.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/products", label: "Manage Products" },
          { href: "/admin/orders", label: "Manage Orders" },
          { href: "/admin/repairs", label: "Manage Repair Jobs" },
          { href: "/admin/customers", label: "Manage Customers" },
          { href: "/admin/inventory", label: "Inventory Logs" },
        ].map((i) => (
          <Link key={i.href} href={i.href} className="rounded-2xl border p-6 hover:bg-zinc-50 dark:border-zinc-800">
            {i.label} →
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-zinc-500">Better Auth will protect this route: unauthorized → redirect to /sign-in.</p>
    </div>
  );
}
