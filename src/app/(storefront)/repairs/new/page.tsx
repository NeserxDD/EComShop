import { createRepair } from "@/lib/actions/repairs";
import { Button } from "@/components/ui/button";

// Vibecode learning: Server Action form — no client JS needed for submit.
// - Form posts to createRepair (server) which checks session, validates, writes to Prisma, redirects.
// - DeviceType enum from Prisma: LAPTOP|DESKTOP|COMPONENT|PERIPHERAL|MONITOR|NETWORK|ACCESSORY|OTHER
// - Images: for MVP paste Cloudinary URLs as JSON; Phase 4 could add direct upload via Cloudinary widget.

export default function NewRepairPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
        Request Repair — Stone & Circuit
      </h1>
      <p className="text-sm text-muted-foreground">Submit online → bring device + ticket to Manila showroom (Mon–Sat 9am–6pm, check-in until 5pm). You’ll get ticketNo like REP-2026-ABC123. Status starts as PENDING until staff confirms Received.</p>

      <form action={createRepair} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <select name="deviceType" required className="rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <option value="LAPTOP">Laptop</option>
            <option value="DESKTOP">Desktop</option>
            <option value="COMPONENT">Component (CPU/GPU/RAM)</option>
            <option value="PERIPHERAL">Peripheral (Keyboard/Mouse)</option>
            <option value="MONITOR">Monitor</option>
            <option value="NETWORK">Network (Router/Switch)</option>
            <option value="ACCESSORY">Accessory</option>
            <option value="OTHER">Other</option>
          </select>
          <input name="brand" placeholder="Brand (e.g., ASUS)" className="rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="model" placeholder="Model (e.g., ROG Strix G15)" className="rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
          <input name="serialNo" placeholder="Serial No (optional)" className="rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
        <textarea
          name="issueDescription"
          placeholder="Describe issue in detail (e.g., No display after RAM upgrade, fan loud...)"
          required
          rows={4}
          className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
        <input name="images" placeholder='Images JSON: ["https://res.cloudinary.com/..."] (optional)' className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
        <input name="estimatedCost" type="number" step="0.01" placeholder="Estimated cost budget PHP (optional)" className="w-full rounded-xl border px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
        <Button type="submit" className="w-full">
          Submit Repair — get ticket
        </Button>
        <p className="text-xs text-zinc-500">Requires sign-in. Server validates session + creates history log atomically.</p>
      </form>
    </div>
  );
}
