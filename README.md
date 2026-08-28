# Stone & Circuit — Computer Store & Care

Official storefront and repair management for laptops, desktops, components and peripherals. Browse products, buy with COD, request a repair and track it by ticket — with a staff dashboard to manage the store.

Live demo: *Portfolio showcase — all transactions are simulated.*

## Features

**Customer website**
- Browse products by category, search and pagination
- Product detail with stock and images
- Cart and COD checkout
- Request repair (device details, issue, images) and track by ticket
- Contact the store
- Orders history and repair history

**Staff / Admin dashboard** (ADMIN / STAFF only)
- Manage products and inventory (stock, low-stock alerts)
- Manage orders
- Manage customers
- Manage repair jobs and update status

## Stack

Next.js 15 (App Router) · Tailwind v4 · Prisma 7 · Supabase Postgres · Better Auth · Cloudinary

## Getting Started

```bash
cp .env.example .env.local
# fill DATABASE_URL, BETTER_AUTH_SECRET, CLOUDINARY_*, Supabase keys
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open http://localhost:3000 — admin at http://localhost:3000/admin

## Project Structure

```
prisma/schema.prisma      # Category (hierarchical), Product, Order, RepairJob
src/app/(storefront)      # Public site: products, cart, checkout, repairs, contact
src/app/(dashboard)       # Admin: products, orders, customers, repairs
src/lib/db.ts             # Prisma singleton
src/lib/auth.ts           # Better Auth + RBAC
```

## License

MIT
