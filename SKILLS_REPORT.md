# EComShop — Installed Skills Report
Generated: 2026-08-28
Workspace: /home/dalope/Projetcs/EComshop
Node: v22.23.2 | npm 10.9.8

## Skill Installation Summary

All skills installed via `npx skills add <owner/repo@skill> -g -y`
Location: ~/.agents/skills/ (universal: Gemini CLI, OpenCode, Copilot, etc. + symlinked for Claude Code)
Supporting-files resolved from each skill's `references/` directory.

| # | Skill ID | Installs | Source Reputation | Purpose for EComShop |
|---|----------|----------|-------------------|----------------------|
| 1 | `vercel-labs/agent-skills@vercel-react-best-practices` | 670.6K | Vercel (official) | React/Next.js performance (70 rules: async waterfalls, bundle, server, rerender). Use for storefront + dashboard components. |
| 2 | `wshobson/agents@nextjs-app-router-patterns` | 28.3K | Community trusted | Next.js 14+ App Router, Server Components, streaming, Server Actions, ISR. Structure `app/(storefront)` + `app/(dashboard)`. |
| 3 | `wshobson/agents@tailwind-design-system` | 61.4K | Community trusted | Tailwind v4 design system, card layouts, responsive grids. |
| 4 | `supabase/agent-skills@supabase` | 243K | Supabase official | Supabase Postgres, Auth, Storage, Realtime, SSR (`@supabase/ssr`), RLS. |
| 5 | `supabase/agent-skills@supabase-postgres-best-practices` | 374K | Supabase official | Postgres perf: indexing, RLS perf, pagination, vacuuming, constraints. Critical for orders/repairs. |
| 6 | `prisma/skills@prisma-postgres` | 236.6K | Prisma official | Prisma Postgres driver + connection config |
| 7 | `prisma/skills@prisma-database-setup` | 243.2K | Prisma official | Prisma ORM setup, migrations, client API |
| 8 | `better-auth/skills@better-auth-best-practices` | 101.8K | Better-Auth official | Auth server/client, adapters (Prisma/Drizzle), session, plugins, email flows. Roles: CUSTOMER/STAFF/ADMIN |
| 9 | `stripe/ai@stripe-best-practices` | 78.6K | Stripe official | Payments: Checkout Sessions vs PaymentIntents, webhooks, restricted keys. Phase 2 payments. |

Verification: All >1K installs, official sources preferred. Security: Gen Safe, 0 socket alerts (Low/Med risk noted in installer). See skill SHAs at https://skills.sh/<owner/repo>.

## How Each Maps to Your Requirements

**Customer Website**
- Browse/Search → `vercel-react-best-practices` (bundle-dynamic-imports, rendering-content-visibility, server-parallel-fetching) + `supabase-postgres-best-practices` (query indexes, pagination)
- Buy/Cart/Checkout → `prisma-database-setup` (Order, OrderItem, InventoryLog) + `stripe-best-practices` (Checkout Sessions, `checkout.session.completed` webhook)
- Request/Track Repair → `prisma` schema (RepairJob, RepairStatusHistory state machine) + `supabase` Realtime optional
- Contact → Server Action via `nextjs-app-router-patterns`

**Staff/Admin Dashboard**
- Manage products/inventory/orders/customers → `prisma` + `supabase-postgres` (RLS per role) + `tailwind-design-system`
- Repair jobs + status updates → Prisma state machine + `better-auth` RBAC (`auth.uid()` + app_metadata checks in RLS)
- Update repair status → triggers email via Resend (add `resend/react-email@react-email` if needed)

## Resolved Skill Instruction Paths

Each SKILL.md may reference `references/` relative to its skill dir. Examples:
- `~/.agents/skills/vercel-react-best-practices/rules/*.md` — 70 performance rules
- `~/.agents/skills/supabase-postgres-best-practices/references/query-*.md`, `security-rls-*.md`
- `~/.agents/skills/better-auth-best-practices` — auth.ts locations, CLI migrate/generate
- `~/.agents/skills/stripe-best-practices/references/payments.md`, `security.md`

Follow each SKILL.md's "When to Use" triggers automatically; consult its `references/` before implementing domain code.

## Fix Applied During Install

- Initial `npx skills use` failed: `styleText` requires Node ≥22 (was 18.19.1). Upgraded via Nodesource 22.x + manual tarball to /usr/local/bin (v22.23.2) to restore npm.
- Installer output saved: /tmp/find-skills.out, /tmp/skills-*.out

## Next Steps (Recommend)

1. Scaffold: `npx create-next-app@latest . --typescript --tailwind --app --eslint`
2. Init Prisma: `npx prisma init` → adapt `prisma-database-setup/references/postgresql.md` + `prisma-postgres/references/*`
3. Supabase project: `supabase init` + `supabase db pull` workflow (see `supabase/SKILL.md` Core Principles)
4. Better Auth: `npm install better-auth`, create `auth.ts`, configure Prisma adapter, `npx @better-auth/cli generate && npx prisma migrate dev`, verify `GET /api/auth/ok`
5. Tailwind theming + layouts: `(storefront)` vs `(dashboard)` route groups per `nextjs-app-router-patterns/references/details.md`
6. Stripe sandbox (Phase 2): `stripe sandbox create` + Checkout Sessions per `stripe-best-practices/references/payments.md`
7. Optional adds not yet installed (evaluate if needed):
   - `resend/react-email@react-email` (8.1K) for repair status emails
   - `nexscope-ai/ecommerce-skills@cross-border-ecommerce` (62.3K) for marketing SEO (non-technical)
   - `heygen-com/hyperframes@tailwind` (72.2K) if Tailwind CDN variant needed

## Commands to Reproduce

```bash
npx skills find ecommerce
npx skills find nextjs
npx skills find supabase
npx skills find prisma
npx skills find stripe
npx skills find auth
npx skills find tailwind
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
npx skills add supabase/agent-skills@supabase -g -y
npx skills add supabase/agent-skills@supabase-postgres-best-practices -g -y
npx skills add prisma/skills@prisma-postgres -g -y
npx skills add prisma/skills@prisma-database-setup -g -y
npx skills add better-auth/skills@better-auth-best-practices -g -y
npx skills add stripe/ai@stripe-best-practices -g -y
npx skills add wshobson/agents@nextjs-app-router-patterns -g -y
npx skills add wshobson/agents@tailwind-design-system -g -y
ls ~/.agents/skills
```

