import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { updateCustomerRole, adminUpdateUser, adminSetPassword, anonymizeUser, banUser, unbanUser } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ show?: string }>;
}) {
  const session = await getSession();
  const currentId = (session?.user as { id?: string } | undefined)?.id;
  const show = (await searchParams)?.show || "all";
  let where: any = {};
  if (show === "active") where = { OR: [{ banned: false }, { banned: null }] };
  if (show === "banned") where = { banned: true };
  // all = no filter
  let users: any[] = [];
  try {
    users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, role: true, phone: true, banned: true, banReason: true, createdAt: true } as unknown as never,
    });
  } catch {
    return <div className="text-sm text-muted-foreground">DB not configured — run migrate & seed.</div>;
  }
  return (
    <div>
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        Customers — {users.length}
      </h1>
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
        ADMIN can edit name/phone, set password (no old needed), promote, soft-delete (anonymize) or ban · self-delete blocked · demo: admin@stoneandcircuit.test / Yuyuneserx@1
      </p>
      <div className="mt-2 flex gap-2 text-xs">
        <a href="/admin/customers?show=all" className={`rounded-full border px-3 py-1 ${show === "all" || !show ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
          All
        </a>
        <a href="/admin/customers?show=active" className={`rounded-full border px-3 py-1 ${show === "active" ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
          Active
        </a>
        <a href="/admin/customers?show=banned" className={`rounded-full border px-3 py-1 ${show === "banned" ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
          Banned (soft deleted)
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {users.map((u) => {
          const isSelf = u.id === currentId;
          const isBanned = (u as any).banned;
          return (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                    {u.name} {isSelf && <span className="text-xs font-mono uppercase tracking-wide text-primary">(you)</span>} {isBanned && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-200">BANNED</span>}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {u.email} · {u.role} · {u.phone || "no phone"}
                  </p>
                  {isBanned && <p className="text-xs text-red-600">Reason: {(u as any).banReason || "—"}</p>}
                </div>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs h-fit">{u.role}</span>
              </div>

              {/* Edit name/phone — admin can modify others */}
              <form action={adminUpdateUser} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <input name="name" defaultValue={u.name} placeholder="Name" required className="flex-1 min-w-[120px] rounded-xl border border-border bg-card px-3 py-1.5 text-xs" />
                <input name="phone" defaultValue={u.phone || ""} placeholder="Phone" className="flex-1 min-w-[120px] rounded-xl border border-border bg-card px-3 py-1.5 text-xs" />
                <Button size="sm" variant="outline" type="submit">
                  Save
                </Button>
              </form>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {/* Promote */}
                <form action={updateCustomerRole} className="flex gap-1">
                  <input type="hidden" name="userId" value={u.id} />
                  <select name="toRole" defaultValue={u.role} className="flex-1 rounded-xl border border-border bg-card px-2 py-1.5 text-xs">
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <Button size="sm" variant="outline" type="submit">
                    Role
                  </Button>
                </form>

                {/* Set password — no old needed for admin-on-others */}
                <form action={adminSetPassword} className="flex gap-1">
                  <input type="hidden" name="userId" value={u.id} />
                  <input name="newPassword" type="password" placeholder="New pass (min 8)" required minLength={8} className="flex-1 rounded-xl border border-border bg-card px-2 py-1.5 text-xs" />
                  <Button size="sm" type="submit">
                    Set PW
                  </Button>
                </form>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {/* Soft delete — anonymize, keeps orders */}
                <form action={anonymizeUser}>
                  <input type="hidden" name="userId" value={u.id} />
                  <Button size="sm" variant={isSelf ? "outline" : "destructive"} disabled={isSelf} type="submit" title={isSelf ? "Admin cannot delete self via admin panel — use /account" : "Soft delete: anonymize, keep orders, ban login"}>
                    {isSelf ? "Cannot delete self" : "Anonymize (soft)"}
                  </Button>
                </form>
                {isBanned ? (
                  <form action={unbanUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <Button size="sm" variant="outline" type="submit">
                      Unban
                    </Button>
                  </form>
                ) : (
                  <form action={banUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="reason" value="Banned by admin" />
                    <Button size="sm" variant="outline" type="submit" disabled={isSelf}>
                      Ban
                    </Button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs font-mono uppercase tracking-wide text-muted-foreground">
        Customers change own name/phone/password/delete via /account (old password required for self). Admin-on-others needs no old password. Delete is soft anonymize, not hard.
      </p>
    </div>
  );
}
