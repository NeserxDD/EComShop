# Learn to Vibe Code — EComShop $0 Free Tier

> This file is your “explain after every phase” guide. Read it like a textbook. Each phase = what we built, why, the exact `file:line` to open, the concept in plain English, and a **Do It Yourself** exercise.
>
> Stack: Next.js 15 App Router + Tailwind v4 + Prisma 7 + Supabase Postgres Free (500MB) + Better Auth (unlimited) + Cloudinary 25GB + Vercel Hobby Free. COD now, Stripe later.

---

## How Vibe Coding Works Here

1. **Prompt → Skill → Code**: You say what you want, I pick a skill (`~/.agents/skills/<skill>/SKILL.md`) and follow its `references/` rules.
2. **Verify by reading**: I never guess — I `Read file:line`, check build, and show you.
3. **You learn by touching 3 files per phase** (see exercises).

Skills we installed (9) — all `>1K installs`, `Safe`:  
`vercel-react-best-practices` (670K) • `nextjs-app-router-patterns` • `tailwind-design-system` • `supabase` + `supabase-postgres-best-practices` • `prisma-postgres` + `prisma-database-setup` • `better-auth-best-practices` • `stripe-best-practices` (stub). See `SKILLS_REPORT.md:1` and `~/.agents/skills/*/SKILL.md`.

---

## Phase 0 — Base Scaffold (You Learn: Project Shape + Database Connection)

### What we changed
- `src/app/layout.tsx:1` — root layout: `Geist` fonts, `metadata {title, description}` for SEO, `children` slot. **Concept**: Every route renders inside this.
- `src/app/(storefront)/page.tsx:1` — Server Component hero + 8-category grid. **No `"use client"`** → runs on server, no JS sent.
- `prisma/schema.prisma:1` — `generator client { output = "../src/generated/prisma" }`, `datasource db { provider = "postgresql" }`, `enum UserRole {CUSTOMER,STAFF,ADMIN}`, `model Category { parentId, parent, children }` (self-relation), `Product { images Json, sku, price Decimal, stockQty }`, `Order/OrderItem`, `RepairJob/History`, `InventoryLog`. **Why Json for images?** Store Cloudinary URLs, not blobs → keeps Supabase 500MB tiny.
- `src/lib/db.ts:1` — Singleton: `globalForPrisma.prisma || new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. **Why singleton?** Vercel serverless + Supabase Free = 60 connections. Hot reload without singleton → “too many clients” error. See `supabase-postgres-best-practices/references/conn-limits.md`.
- `src/lib/cloudinary.ts:1` — `cloudinary.config({... secure:true})`, helpers `cloudinaryUrl` + `extractPublicId`. **Free tier**: 25GB → 25k images; seed 45×3 = 30MB.
- `prisma/seed.ts:1` — 8 tops → 15 leaves → 3/leaf = 45 products. Clears in FK order, creates parents then leaves, then `product.create` + `inventoryLog INITIAL`. **Idempotent** — run again and it wipes + recreates.
- `.env.example:1` — `DATABASE_URL` pooled `6543?pgbouncer=true` vs `DIRECT_URL` 5432 for migrate. `BETTER_AUTH_SECRET = openssl rand -base64 32`.

### Plain English
- **Route Groups `(storefront)` vs `(dashboard)`**: Folder name in `()` is invisible to URL. `/products` lives at `src/app/(storefront)/products/page.tsx:1` but URL is still `/products`. Lets us have two layouts: public header vs admin guard.
- **Prisma 7 adapter**: Old Prisma `new PrismaClient()` no longer works. Now `new PrismaPg({connectionString})` + `new PrismaClient({ adapter })`. Found in `src/generated/prisma/client.ts:1`.

### Do It Yourself (5 min)
1. Open `prisma/schema.prisma:10` — add `@@index([isActive])` to `Product` (already there). Ask: *why index `isActive`?* → filters every storefront query.
2. Open `src/lib/db.ts:12` — comment `adapter` line and run `npm run build` — see build fail → learn why adapter is mandatory.
3. Run `npx prisma validate` — should say “valid 🚀”.

---

## Phase 1 — Auth + RBAC (You Learn: Sessions + Role Guards)

### What we changed
- `src/lib/auth.ts:1` — `betterAuth({ secret, baseURL, database: prismaAdapter(db,{provider:"postgresql"}), emailAndPassword:{enabled:true}, additionalFields:{role, phone}, databaseHooks:{user.create.before → role||CUSTOMER}, trustedOrigins })`. **Free & unlimited** vs Clerk 10k MAU.
- `src/app/api/auth/[...all]/route.ts:1` — `toNextJsHandler(auth)` → `POST/GET /api/auth/*`. Verify `GET /api/auth/ok` → `{status:"ok"}` (skill workflow step 6).
- `src/lib/auth-client.ts:1` — `"use client"` + `createAuthClient` → `signIn.email, signUp.email, useSession`.
- `src/lib/session.ts:1` — `auth.api.getSession({ headers: await headers() })` (Server only, reads cookies). `requireRole(["STAFF","ADMIN"])`.
- `src/app/(storefront)/layout.tsx:1` — header shows `user.name (role)` or Sign in/up. `await getSession()` on server → no waterfall (`vercel-react-best-practices` → `async-parallel`).
- `src/app/(dashboard)/layout.tsx:1` — guard: `if (!ok) redirect("/sign-in?next=/admin")`. No client flash.
- `src/app/(storefront)/sign-in/page.tsx:1` + `sign-up/page.tsx:1` — client forms, `authClient.signIn.email({email,password}, {onSuccess: router.push(next)})`.

### Plain English
- **RBAC**: `User.role` enum `CUSTOMER|STAFF|ADMIN`. Client never sets role (`input:false`) — only DB `UPDATE user SET role='ADMIN'`.
- **Better Auth vs NextAuth**: Better Auth stores sessions in Postgres (you own data), NextAuth similar but Better Auth has `additionalFields` + `prismaAdapter` cleaner.

### Do It Yourself
1. Sign up at `/sign-up` → open Supabase `user` table — see `role=CUSTOMER`, `emailVerified=false`.
2. In `src/lib/auth.ts:22` change `input: false` to `true`, rebuild — now client could pass `role: ADMIN` (security hole). Change back!
3. Try visiting `/admin` as CUSTOMER → see redirect with `?reason=role:CUSTOMER`.

### Skill
`better-auth-best-practices:14` (Setup Workflow) and `supabase:35` security checklist (RLS, `app_metadata` vs `user_metadata`).

---

## Phase 2 — Commerce (You Learn: Server Actions + Transactions + Search)

### What we changed
- `src/lib/actions/products.ts:1` — `"use server"` → `createProduct(formData)` (parses `FormData`, `slugify(name) + Date.now()`, `db.product.create` + `inventoryLog INITIAL`, `revalidatePath` + `redirect`). `updateProductStock` (`increment: delta`, `reason: RESTOCK|ADJUSTMENT`, LOW log), `toggleProductActive`.
- `src/lib/actions/cart.ts:1` — `checkoutCOD` → `getSession()` → parse `cart` JSON → `db.product.findMany` → check `stockQty` → `db.$transaction` (create Order + loop `orderItem.create` + `product.update decrement` + `inventoryLog SALE` + low-stock `console.warn`). OrderNo `ECOM-2026-XXXX`.
- `src/app/(storefront)/products/page.tsx:1` — `dynamic="force-dynamic"`, `searchParams q,cat,page`, `where {isActive:true, categoryId?, OR:[name contains, description contains]}` (`mode:insensitive` = Postgres ILIKE, free), pagination `skip/take` (12/page), chips for `category parentId=null`. Handles dummy DB with `try/catch`.
- `src/app/(storefront)/products/[slug]/page.tsx:1` + `add-to-cart.tsx:1` — `findUnique slug` + `generateMetadata`, localStorage `ecom_cart` (`readCart/writeCart` + `dispatchEvent("cart:updated")`), qty controls, client stock check + server re-check at checkout.
- `src/app/(storefront)/cart/page.tsx:1` — reads `localStorage`, `updateQty/remove`, `formatPrice`.
- `src/app/(storefront)/checkout/page.tsx:1` — hidden `cart` + `shippingAddress` JSON → `checkoutCOD`.
- `src/app/(dashboard)/admin/products/page.tsx:1` — table with `LOW` badge `stockQty <= lowStockThreshold`, `toggleProductActive` + `updateProductStock -1/+5`.
- `src/app/(storefront)/orders/*:1` — `getSession()` → `findMany where userId`, `/orders/[id]` checks `owner || ADMIN/STAFF`.

### Plain English
- **Server Actions**: Functions with `"use server"` run only on server — secrets safe, no API route needed. `<form action={createProduct}>` works without JS.
- **Transaction**: `db.$transaction(async tx => { create Order → loop create Items → decrement stock → log })` ensures either all succeed or none — keeps inventory correct even under free-tier concurrency. See `supabase-postgres-best-practices/references/lock-short-transactions.md`.
- **Free search**: `contains` + index `categoryId, isActive` is fine for 45 rows. At 5k rows, switch to `tsvector` per `advanced-full-text-search.md`.

### Do It Yourself
1. Create product at `/admin/products/new` → see `InvestmentLog` row in Prisma Studio `npx prisma studio`.
2. Add to cart → open DevTools → Application → Local Storage → `ecom_cart` → edit qty to 999 → checkout → see server error “Insufficient stock” (server beats client).
3. In `products/page.tsx:22` change `take=12` to `2` — see pagination appear.

---

## Phase 3 — Repair State Machine (You Learn: Enums + History + Guard)

### What we changed
- `prisma/schema.prisma` → `enum RepairStatus {RECEIVED,DIAGNOSING,WAITING_PARTS,REPAIRING,TESTING,READY,DELIVERED,CANCELLED}`, `enum DeviceType {LAPTOP...}`, `model RepairJob { ticketNo unique, customerId, assignedToId, images Json, status, partsUsed Json, history }`, `model RepairStatusHistory { fromStatus, toStatus, changedById }`.
- `src/lib/actions/repairs.ts:1` — `transitions: Record<string,string[]>` (e.g., `RECEIVED: [DIAGNOSING,CANCELLED]`), `createRepair` → `ticketNo REP-YYYY-XXXX` + `status RECEIVED` + history, `updateRepairStatus` → fetch `job.status`, `if !allowed.includes(toStatus) throw`, `$transaction` update + history create.
- `src/app/(storefront)/repairs/new/page.tsx:1` — form `deviceType, brand, model, serialNo, issueDescription, images, estimatedCost` → `createRepair`.
- `src/app/(storefront)/repairs/track/page.tsx:1` — `?ticket=REP-...` → `findFirst ticketNo` + `history orderBy asc`, steps array + timeline `TESTING→READY` etc.
- `src/app/(storefront)/repairs/my/page.tsx:1` — `where customerId=userId`.
- `src/app/(dashboard)/admin/repairs/page.tsx:1` — list 30 jobs, select `toStatus`, `note`, `finalCost` → `updateRepairStatus`.

### Plain English
- **State machine**: Not any status → any status. `TESTING → READY` ok, `READY → RECEIVED` throws. Keeps workflow honest.
- **Ticket vs Login**: Track by `ticketNo` without login (shareable) — but create requires login.

### Do It Yourself
1. Create repair at `/repairs/new` → note ticket → try admin update `RECEIVED → READY` → see error → follow allowed path `RECEIVED→DIAGNOSING→REPAIRING→TESTING→READY`.
2. Open `src/lib/actions/repairs.ts:9` and add `READY: ["DELIVERED","REPAIRING"]` to allow re-open — see flexibility.
3. At `/repairs/track?ticket=...` edit URL ticket to wrong value → see “No repair found”.

---

## Phase 4 — Deploy + Stripe Stub (You Learn: Free Ops)

### What we changed
- `src/app/(storefront)/contact/page.tsx:1` — Resend stub.
- `src/lib/stripe.ts:1` + `src/app/api/stripe/webhook/route.ts:1` — `501 Not Configured` until `STRIPE_SECRET_KEY` set. Comments show Checkout Sessions + webhook `checkout.session.completed` gated on `payment_status==='paid'`.
- `next.config.ts:4` — `images.remotePatterns: res.cloudinary.com, **.supabase.co` for `next/image`.
- `README.md:1` — $0 guide + `npm run seed` + Vercel steps.
- Build: `npm run build` → 21 routes (`ƒ` dynamic, `○` static) per `nextjs-app-router-patterns`.

### Plain English
- **$0 Deploy**: Vercel Hobby auto-builds on `git push`. Env vars in Vercel Dashboard. Supabase pauses after 7d idle → wake in dashboard (or keep `Neon` free which doesn’t pause).
- **Stripe later**: COD keeps you $0 today. When ready, `npm i stripe @stripe/stripe-js`, uncomment `stripe.ts`, create `checkout.sessions.create({ integration_identifier: "ecomshop_"+random })`.

### Do It Yourself
1. Set real `DATABASE_URL` (Supabase pooled 6543) → `npx prisma migrate dev --name init` → `npm run seed` → refresh `/products` → see 45 products.
2. Deploy: `git push origin main` → Vercel → check `/api/health` → `{status:"ok", db:"connected"}`.
3. Try Stripe stub `POST /api/stripe/webhook` → 501 → now uncomment per guide.

---

## Your Next Vibe Tasks (pick one, prompt me)

- “Add search pagination cursor instead of offset for 5k products” → I’ll swap `skip/take` for `cursor` per `supabase-postgres-best-practices/references/data-pagination.md`.
- “Make images upload directly to Cloudinary in /admin/products/new” → I’ll add widget + Server Action `cloudinary.uploader.upload`.
- “Wire Resend for repair status email” → I’ll add `after(() => resend.emails.send(...))` per `vercel-react-best-practices: server-after-nonblocking`.
- “Add order status update in /admin/orders” → I’ll create `updateOrderStatus` with same transition map.

> Tip: Before prompting, open the file mentioned after `file:line` and read 20 lines. You’ll learn faster by seeing, not just vibing.
