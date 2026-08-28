import { db } from "@/lib/db";
import { updateCustomerRole } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  let users: any[] = [];
  try {
    users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true } as unknown as never });
  } catch {
    return <div className="text-sm text-zinc-500">DB not configured.</div>;
  }
  return (
    <div>
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        Customers — {users.length}
      </h1>
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">ADMIN can promote · demo logins pre-seeded</p>
      <div className="mt-4 overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs font-mono uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Role</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-right">Promote</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-center">
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs">{u.role}</span>
                </td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3">
                  <form action={updateCustomerRole} className="flex justify-end gap-1">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="toRole" defaultValue={u.role} className="rounded-xl border border-border bg-card px-2 py-1 text-xs">
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <Button size="sm" variant="outline" type="submit">
                      Set
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
