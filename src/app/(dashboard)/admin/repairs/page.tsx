import { db } from "@/lib/db";
import { updateRepairStatus } from "@/lib/actions/repairs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const allStatuses = ["RECEIVED", "DIAGNOSING", "WAITING_PARTS", "REPAIRING", "TESTING", "READY", "DELIVERED", "CANCELLED"] as const;

export default async function AdminRepairsPage() {
  let jobs: any[] = [];
  try {
    jobs = await db.repairJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { customer: { select: { name: true, email: true } }, assignedTo: { select: { name: true } } },
    });
  } catch {
    return <div className="text-sm text-zinc-500">DB not configured — set DATABASE_URL.</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Repair Jobs — {jobs.length}</h1>
      <p className="text-xs text-zinc-500">State machine: RECEIVED → DIAGNOSING → WAITING_PARTS → REPAIRING → TESTING → READY → DELIVERED. STAFF/ADMIN only.</p>

      <div className="mt-4 space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border p-4 dark:border-zinc-800">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-mono text-xs">{j.ticketNo}</span>
              <span className="rounded-full border px-2 py-0.5 text-xs dark:border-zinc-800">{j.status}</span>
            </div>
            <p className="text-sm font-medium mt-1">
              {j.deviceType} {j.brand} {j.model} — {j.customer?.name} ({j.customer?.email})
            </p>
            <p className="text-xs text-zinc-500">Issue: {j.issueDescription.slice(0, 120)} • Est: {j.estimatedCost ?? "—"} → Final: {j.finalCost ?? "—"}</p>
            <p className="text-xs text-zinc-500">Created: {new Date(j.createdAt).toLocaleString()}</p>

            <form action={updateRepairStatus} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={j.id} />
              <select name="toStatus" defaultValue={j.status} className="rounded-xl border px-2 py-1.5 text-xs dark:border-zinc-800">
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input name="note" placeholder="note (optional)" className="rounded-xl border px-2 py-1.5 text-xs dark:border-zinc-800" />
              <input name="finalCost" placeholder="finalCost" type="number" step="0.01" className="w-24 rounded-xl border px-2 py-1.5 text-xs dark:border-zinc-800" />
              <Button size="sm" type="submit">
                Update
              </Button>
            </form>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-sm text-zinc-500">No repairs — submit via /repairs/new.</p>}
      </div>
    </div>
  );
}
