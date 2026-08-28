# Handover — Stone & Circuit (EComShop) — 2026-08-29

> Paste this + `LEARN_VIBE_CODE.md` + `git log --oneline -5` into a fresh chat to resume. No re-explaining needed.

## One-Line
Portfolio showcase: **Stone & Circuit — Computer Store & Care** (official, warm premium trustworthy, Manila) — Next.js 15 + Tailwind v4 + Prisma 7 + Supabase Free (500MB) + Better Auth (unlimited) + Cloudinary 25GB + Vercel Hobby Free — 8 tops → 18 leaves → 54 parents + 9 variants (Seagate 250/500/1TB, Corsair 8/16/32, ASUS Silver/Black/Eclipse Gray) + 60 logs, 23 categories, live DB, warm stone W1 #fafaf9 + amber 600.

## Decisions Log (So You Don't Re-Decide)
- **Name:** A Stone & Circuit (not EComShop, not Hearth) — metadata, header S chip EST. 2026, hero "Genuine parts. Expert care."
- **Stack $0:** Vercel Hobby (100GB, hobby non-commercial → Cloudflare Pages if business), Supabase Free pooled `aws-0-ap-northeast-2:6543?pgbouncer=true` (app) + direct `5432` (migrate) — project `auosuvabmvifkuuxjiup`, Cloudinary demo (25GB free), Better Auth (not Clerk), COD now, Stripe stub 501 (later).
- **Design:** W1 stone subtle warm #fafaf9 (not pure white #ffffff, not beige #fdf8f6, not bryl monochrome/pixel/halftone). Tokens in `src/app/globals.css:1` (stone 50/100/200 hairline, amber 600 primary, 500ms crossfade, warm-mesh, fadeUp). Fonts Geist/Geist Mono + Inter display. Header sticky hairline, dashboard 14rem sidebar, shadcn rounded-xl + warm shadow 0 4px 24px, not plain. Skills used: anthropics/frontend-design 828K + shadcn 271K + vercel web-guidelines 585K (reuses tailwind-design-system, vercel-react-best-practices) — **no bryl-minimal**.
- **Official not dev:** Removed `8 tops → 15 leaves`, `Stone 50 #fafaf9`, `$0 Free Tier`, `Phase 0 scaffold`, `Seed with npm run seed` from hero/category/footer/products empty → now "Genuine parts. Expert care.", "Shop by Category — Curated for builders", "Visit our Manila showroom", footer "Stone & Circuit · Manila · Mon–Sat 9am–6pm". README simple (no $0 brag, no vibe learn link) at `README.md:1`.
- **Category Hierarchy:** 8 tops → 15 leaves (now 18 leaves after seed) → products linked to leaves. Filter `src/app/(storefront)/products/page.tsx:28` now `IN [parent + children]` (top shows all, e.g., Components 18) + sub-chips drill-down. Leaf (CPU) shows siblings (CPU/GPU...) + parent top stays active, variant filter gone bug fixed at `a0f02b7`.
- **Header Gating:** `src/app/(storefront)/layout.tsx:68` Admin link gated `isStaff = STAFF/ADMIN` only, Sign up hidden when authed, My Repairs/Orders for CUSTOMER, S chip. Sign-out now `src/components/sign-out-button.tsx:1` → `authClient.signOut POST` (not Link GET 404) at `30fd696`.
- **Auth/RBAC:** `src/lib/auth.ts:1` betterAuth + prismaAdapter + `admin` plugin + `user.deleteUser.enabled:true` (soft), `additionalFields role input:false, phone input:true`, `src/lib/auth-client.ts:1` adminClient(). `prisma/schema.prisma:67` Account.issuer (1.7) + User.banned/banReason/banExpires. Demo users seeded via `hashPassword` scrypt `salt:key`: `admin@stoneandcircuit.test / Yuyuneserx@1 ADMIN`, `staff@... / Yuyuneserx@1 STAFF`, `customer@demo.test / Yuyuneserx@1 CUSTOMER` (exposed here — rotate after). Admin-on-others set password **no old**, self changePassword **needs old** (your approval), admin cannot delete self via admin panel (blocked, use /account).
- **Soft Delete Standard:** Keep `Order/RepairJob RESTRICT` (not CASCADE) — Saleor/WooCommerce/PrestaShop standard: anonymize `name→Deleted User, email→deleted+id@stoneandcircuit.test, banned=true` + `DELETE session` (keeps orders), not hard DELETE. `admin/customers/page.tsx:1` Anonymize (soft) + Ban/Unban + filter `?show=all|active|banned` (default all shows Deleted User as you like). Hard delete would need `CASCADE` and would vaporize `ECOM-…` orders — not used.
- **Variations (Option A done):** `prisma/schema.prisma:110` Product + `ProductVariant {sku @unique, label, options Json capacity/color, price, stockQty, image, isActive}` + `OrderItem/InventoryLog variantId SetNull`. Parent canonical slug, search parent. Seed `Seagate 250/500/1TB`, `Corsair 8/16/32`, `ASUS Silver/Black/Eclipse Gray` each own price/stock/sku (parent price=min, stock=sum). Storefront `[slug]/page.tsx` VariantPicker radio, `add-to-cart.tsx` key `productId::variantId`, `cart/page.tsx` variantLabel, `checkoutCOD` validates variant stock, `admin/products/new/variant-form.tsx` dynamic rows + `createProductWithVariants` transaction. Build 23 routes OK (was 14 → +inventory + account).
- **Hydration:** `src/app/layout.tsx:44` → `<Script id="theme" strategy="beforeInteractive" suppressHydrationWarning>` fixes `A tree hydrated…` from `localStorage` + `chrome-extension://lgblnfid…` injection.

## Live State
- **DB:** Supabase `auosuvabmvifkuuxjiup` migrated (product_variant + issuer + banned) via `pg` `CREATE TABLE` + `ALTER` (prisma migrate hangs on pgbouncer), seeded `54 parents + 9 variants + 60 logs + 3 users`, `pool.query SELECT` verified. `DATABASE_URL` pooled `...6543?pgbouncer=true`, `DIRECT_URL` direct `5432` in `.env.local` / `.env` (ignored, not committed).
- **Git:** `NeserxDD/EComShop:main` up to `30fd696` (+ `eddbbf3` variations, `d33b1b4` soft filter, `2cbf2db` account, `73753c4` hydration, `a0f02b7` sub-chip, `6e77e29` header gating, `e1ee21c` Option A live, `abf5801` warm stone, `efcd626` Stone & Circuit rebrand). Build `npm run build` → 23 routes `ƒ` dynamic OK. Dev `http://localhost:3000` hot-reloaded, `curl /products?cat=components` 12/18, `?cat=components-cpu` Filter still shows.
- **Needs Rotate:** `Yuyuneserx@1` + `ghp_...` (classic `repo` PAT you pasted in chat) exposed — revoke & regenerate `repo`-only 30d after handover, then `git remote set-url origin https://<NEW_TOKEN>@github.com/NeserxDD/EComShop.git && git push`.

## Next TODO (You Picked A Already Done, Next Up)
- **Next phase you approved:** Keep `soft` (no hard CASCADE). Optional polish already added `?show` filter. Next you mentioned **Stripe** or **Resend** after A — still pending.
- **Tomorrow:** Run `npm run dev` → test `admin@stoneandcircuit.test / Yuyuneserx@1` at `/sign-in` → `/admin` → try new `Anonymize` + `/products/seagate-barracuda-hdd-storage` variant picker → `/cart` → `Checkout COD` with variant → `/orders`. All warm stone.

## How to Resume
New chat paste:
```
Continue Stone & Circuit from docs/HANDOVER.md + LEARN_VIBE_CODE.md
Repo: https://github.com/NeserxDD/EComShop
Stack: Next.js 15 + warm stone W1, Supabase pooled 6543?pgbouncer=true, 54+9 variants live
Demo: admin@stoneandcircuit.test / Yuyuneserx@1 (rotate after)
Next: [your next phase]
```
Then I’ll `Read docs/HANDOVER.md:1`, `LEARN_VIBE_CODE.md:1`, `git log --oneline -5`, `src/app/(storefront)/products/page.tsx:28` and be back in Build Mode.

## Files to Remember
- `prisma/schema.prisma:110`, `prisma/seed.ts:1`, `src/app/layout.tsx:44`, `src/app/globals.css:1`, `src/app/(storefront)/layout.tsx:68`, `src/app/(storefront)/page.tsx:11`, `src/app/(storefront)/products/page.tsx:28`, `src/app/(storefront)/products/[slug]/page.tsx:1`, `src/lib/auth.ts:1`, `src/lib/auth-client.ts:1`, `src/lib/actions/customers.ts:1`, `src/components/sign-out-button.tsx:1`, `docs/HANDOVER.md:1`
