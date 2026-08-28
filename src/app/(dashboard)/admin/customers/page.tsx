import { db } from "@/lib/db";

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
      <h1 className="text-xl font-bold">Customers — {users.length}</h1>
      <div className="mt-4 overflow-auto rounded-2xl border dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Role</th>
              <th className="p-3 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t dark:border-zinc-800">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-center">
                  <span className="rounded-full border px-2 py-0.5 text-xs dark:border-zinc-800">{u.role}</span>
                </td>
                <td className="p-3">{u.phone || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
