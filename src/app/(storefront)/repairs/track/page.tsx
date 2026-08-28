import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const steps: string[] = ["RECEIVED", "DIAGNOSING", "WAITING_PARTS", "REPAIRING", "TESTING", "READY", "DELIVERED"];

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
        <input name="ticket" defaultValue={ticket} placeholder="Enter ticketNo e.g., REP-2026-ABC123" className="flex-1 rounded-xl border px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
        <button className="rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black">Track</button>
      </form>

      {!ticket && <p className="mt-4 text-sm text-zinc-500">Enter ticketNo above. No login needed for tracking — but creation requires sign-in.</p>}

      {ticket && !job && <p className="mt-4 text-sm text-red-600">No repair found for ticket {ticket}. Check spelling or request at /repairs/new.</p>}

      {job && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border p-4 dark:border-zinc-800">
            <p className="font-mono text-xs">{job.ticketNo}</p>
            <p className="text-sm font-medium">
              {job.deviceType} {job.brand} {job.model} — {job.status}
            </p>
            <p className="text-xs text-zinc-500">
              {job.customer?.name} • {new Date(job.createdAt).toLocaleString()}
            </p>
            <p className="text-sm mt-2">Issue: {job.issueDescription}</p>
            {job.finalCost != null && <p className="text-sm font-semibold mt-1">Final cost: {String(job.finalCost)}</p>}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border p-4 dark:border-zinc-800">
            <p className="text-sm font-medium">Status Timeline</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((s) => {
                const reached = steps.indexOf(s) <= steps.indexOf(job.status);
                const isCurrent = s === job.status;
                return (
                  <span key={s} className={`rounded-full border px-2 py-1 text-xs ${isCurrent ? "bg-black text-white dark:bg-white dark:text-black" : reached ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-400 border-dashed"}`}>
                    {s}
                  </span>
                );
              })}
              {job.status === "CANCELLED" && <span className="rounded-full bg-red-600 px-2 py-1 text-xs text-white">CANCELLED</span>}
            </div>
            <div className="mt-4 space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex justify-between text-xs border-t pt-2 dark:border-zinc-800">
                  <span>
                    {h.fromStatus || "—"} → <strong>{h.toStatus}</strong> {h.note ? `• ${h.note}` : ""}
                  </span>
                  <span className="text-zinc-500">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs text-zinc-500">No history yet.</p>}
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
