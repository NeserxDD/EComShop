import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const steps: string[] = ["PENDING", "RECEIVED", "DIAGNOSING", "WAITING_PARTS", "REPAIRING", "TESTING", "READY", "DELIVERED"];

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ ticket?: string; created?: string }> }) {
  const { ticket, created } = await searchParams;

  let job: any | null = null;
  let history: any[] = [];
  if (ticket) {
    try {
      job = await db.repairJob.findFirst({
        where: { ticketNo: ticket },
        include: { customer: { select: { name: true, email: true } }, history: { orderBy: { createdAt: "asc" } } },
      });
      if (job) history = job.history as any[];
    } catch {
      // DB dummy → show not found
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold">Track Repair</h1>
      {created && ticket && (
        <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Created! Save your ticket: <span className="font-mono font-bold">{ticket}</span>
        </div>
      )}

      <form className="mt-6 flex gap-2">
        <input name="ticket" defaultValue={ticket} placeholder="Enter ticketNo e.g., REP-2026-ABC123" className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
        <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm">Track</button>
      </form>

      {!ticket && <p className="mt-4 text-sm text-muted-foreground">Enter ticketNo above. No login needed for tracking — but creation requires sign-in.</p>}

      {ticket && !job && <p className="mt-4 text-sm text-red-600">No repair found for ticket {ticket}. Check spelling or request at /repairs/new.</p>}

      {job && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="font-mono text-xs text-muted-foreground">{job.ticketNo}</p>
            <p className="text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>
              {job.deviceType} {job.brand} {job.model} — {job.status}
            </p>
            <p className="text-xs text-muted-foreground">
              {job.customer?.name} • {new Date(job.createdAt).toLocaleString()}
            </p>
            <p className="text-sm mt-2 text-foreground">Issue: {job.issueDescription}</p>
            {job.finalCost != null && <p className="text-sm font-semibold mt-1">Final cost: {String(job.finalCost)}</p>}
          </div>

          {/* Timeline — warm amber, not black */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>
              Status Timeline
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((s) => {
                const reached = steps.indexOf(s) <= steps.indexOf(job.status);
                const isCurrent = s === job.status;
                return (
                  <span
                    key={s}
                    className={`rounded-full border px-2 py-1 text-xs ${isCurrent ? "bg-primary text-primary-foreground border-primary" : reached ? "bg-muted text-muted-foreground border-border" : "text-muted-foreground border-dashed border-border"}`}
                  >
                    {s}
                  </span>
                );
              })}
              {job.status === "CANCELLED" && <span className="rounded-full bg-destructive px-2 py-1 text-xs text-destructive-foreground">CANCELLED</span>}
            </div>
            <div className="mt-4 space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex justify-between text-xs border-t border-border pt-2">
                  <span className="text-foreground">
                    {h.fromStatus || "—"} → <strong>{h.toStatus}</strong> {h.note ? `· ${h.note}` : ""}
                  </span>
                  <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs text-muted-foreground">No history yet.</p>}
            </div>
          </div>

          <Link href="/repairs/new" className="text-xs underline">
            Request another repair
          </Link>
        </div>
      )}
    </div>
  );
}
