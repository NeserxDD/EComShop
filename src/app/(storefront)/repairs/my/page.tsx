import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MyRepairsPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/sign-in?next=/repairs/my");

  let jobs: any[] = [];
  try {
    jobs = await db.repairJob.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      include: { history: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  } catch {
    return <div className="mx-auto max-w-2xl px-6 py-8 text-sm text-zinc-500">DB not configured.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold">My Repairs — {jobs.length}</h1>
      <p className="text-sm text-zinc-500">Your tickets. Click to track.</p>
      <div className="mt-4 space-y-3">
        {jobs.map((j) => (
          <Link key={j.id} href={`/repairs/track?ticket=${j.ticketNo}`} className="block rounded-2xl border p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <div className="flex justify-between">
              <span className="font-mono text-xs">{j.ticketNo}</span>
              <span className="rounded-full border px-2 py-0.5 text-xs dark:border-zinc-800">{j.status}</span>
            </div>
            <p className="text-sm font-medium">
              {j.deviceType} {j.brand} {j.model}
            </p>
            <p className="text-xs text-zinc-500">Created {new Date(j.createdAt).toLocaleString()}</p>
          </Link>
        ))}
        {jobs.length === 0 && (
          <p className="text-sm text-zinc-500">
            No repairs yet — <Link href="/repairs/new" className="underline">request one</Link>
          </p>
        )}
      </div>
    </div>
  );
}
