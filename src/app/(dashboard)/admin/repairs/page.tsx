import { db } from "@/lib/db";
import { updateRepairStatus } from "@/lib/actions/repairs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const allStatuses = ["RECEIVED", "DIAGNOSING", "WAITING_PARTS", "REPAIRING", "TESTING", "READY", "DELIVERED", "CANCELLED"] as const;

export default async function AdminRepairsPage() {
  let jobs: any[] = [];
  let staff: any[] = [];
  try {
    [jobs, staff] = await Promise.all([
      db.repairJob.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { customer: { select: { name: true, email: true } }, assignedTo: { select: { name: true } } },
      }),
      db.user.findMany({ where: { role: { in: ["STAFF", "ADMIN"] } }, select: { id: true, name: true, email: true } }),
    ]);
  } catch {
    return <div className="text-sm text-muted-foreground">DB not configured — run migrate & seed.</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        Repair Jobs — {jobs.length}
      </h1>
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
        Stone warm · State machine · Assign + parts tracked
      </p>

      <div className="mt-4 space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-mono text-xs">{j.ticketNo}</span>
              <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs">{j.status}</span>
            </div>
            <p className="text-sm font-medium mt-1">
              {j.deviceType} {j.brand} {j.model} — {j.customer?.name} ({j.customer?.email})
            </p>
            <p className="text-xs text-muted-foreground">
              Issue: {j.issueDescription.slice(0, 120)} · Est: {j.estimatedCost ?? "—"} → Final: {j.finalCost ?? "—"} · Assigned: {j.assignedTo?.name || "—"}
            </p>
            <p className="text-xs text-muted-foreground">Created: {new Date(j.createdAt).toLocaleString()}</p>
            {j.partsUsed && (j.partsUsed as unknown[]).length > 0 && (
              <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Parts: {JSON.stringify(j.partsUsed)}</p>
            )}

            <form action={updateRepairStatus} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={j.id} />
              <select name="toStatus" defaultValue={j.status} className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs">
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select name="assignedToId" defaultValue={j.assignedToId || ""} className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs">
                <option value="">Unassigned</option>
                {staff.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <input name="partsUsed" placeholder='parts JSON e.g. ["RAM 16GB"]' defaultValue={j.partsUsed ? JSON.stringify(j.partsUsed) : ""} className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs flex-1 min-w-[140px]" />
              <input name="note" placeholder="note" className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs" />
              <input name="finalCost" placeholder="final" type="number" step="0.01" defaultValue={j.finalCost ?? ""} className="w-20 rounded-xl border border-border bg-card px-2 py-1.5 text-xs" />
              <Button size="sm" type="submit">
                Save
              </Button>
            </form>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-sm text-muted-foreground">No repairs — submit via /repairs/new.</p>}
      </div>
    </div>
  );
}
