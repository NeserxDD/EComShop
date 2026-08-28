# EComShop — $0 Free Tier E-commerce + Computer Repair Management

Stack: **Next.js 15 (App Router) + Tailwind v4 + Prisma 7 + Supabase Free (500MB) + Better Auth (unlimited) + Cloudinary 25GB + Vercel Hobby Free**. COD now, Stripe later.

## Why $0?
- **Vercel Hobby**: 100GB BW, 6000h — hobby non-commercial. If business, same code deploys to Cloudflare Pages free.
- **Supabase Free**: 500MB DB fits ~5k products (seed = 45 products ~3MB). 1GB storage reserved, images on Cloudinary.
- **Cloudinary Free**: 25GB → ~25k images (seed 45×3 = 30MB).
- **Better Auth**: self-hosted, no MAU limit vs Clerk 10k.
- **COD + Stripe test mode**: $0 until first live sale.

## 8 Tops → 15 Leaves → 3/leaf Seed (40-45 products)
Laptops (Gaming/Business), Desktops (Gaming/Office), Components (CPU/GPU/RAM/Storage/Motherboard/PSU), Peripherals (Keyboard/Mouse/Headset), Monitors, Networking (Router/Switch), Accessories, Refurbished. Scalable to 10/leaf (150 products) with no migration.

## Quick Start
```bash
cp .env.example .env.local  # fill Supabase pooled 6543 URL + Cloudinary
npm install
npx prisma generate
npx prisma migrate dev --name init   # requires DATABASE_URL
npm run seed                          # 45 demo products
npm run dev                           # http://localhost:3000
```

## Free Tier Env (.env.example)
DATABASE_URL (Supabase pooled 6543 + ?pgbouncer=true), DIRECT_URL (5432 for migrate), BETTER_AUTH_SECRET (openssl rand -base64 32), BETTER_AUTH_URL, CLOUDINARY_*, NEXT_PUBLIC_SUPABASE_*

## Routes
- `/` — hero + categories
- `/products` → ?q=&cat=&page= (Prisma contains, categoryId index, pagination)
- `/products/[slug]` → detail + AddToCart (localStorage)
- `/cart` → localStorage, `/checkout` → Server Action checkoutCOD (transaction: Order+Items+stock—InventoryLog)
- `/orders`, `/orders/[id]` — my orders
- `/repairs/new` → createRepair (ticket REP-2026-...), `/repairs/track?ticket=`, `/repairs/my`
- `/contact` — Resend stub
- `/admin/*` — STAFF/ADMIN only via (dashboard)/layout.tsx guard: products (stock + toggle), orders, customers, repairs (state machine)

## Repair State Machine
RECEIVED → DIAGNOSING → WAITING_PARTS → REPAIRING → TESTING → READY → DELIVERED (CANCELLED branch). Validated in updateRepairStatus via transitions map per vercel-react-best-practices async-parallel.

## Skills Used (9, ~/.agents/skills/)
vercel-react-best-practices (670K), nextjs-app-router-patterns, tailwind-design-system, supabase + postgres-best-practices, prisma-postgres + database-setup, better-auth-best-practices, stripe-best-practices (stub).

## Vercel Deploy ($0)
1. Push to GitHub
2. Import in Vercel → add env vars
3. Build passes with dummy DB; runtime needs real Supabase URL
4. Supabase auto-pauses after 7d — wake via dashboard or switch to Neon/Prisma Postgres free

## Stripe Later
Uncomment src/lib/stripe.ts + src/app/api/stripe/webhook/route.ts, set STRIPE_SECRET_KEY, road-map per stripe-best-practices/references/payments.md (Checkout Sessions, dynamic payment methods, webhook fulfilled).

## Learn Vibe Coding
Each phase explains changes: Phase 0 singleton Prisma, Phase 1 Better Auth RBAC, Phase 2 Server Actions + transactions, Phase 3 state machine, Phase 4 free-tier ops. Ask after any file!
