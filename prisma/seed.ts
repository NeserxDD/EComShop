import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "@better-auth/utils/password";
import "dotenv/config";
import { randomUUID } from "crypto";

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) throw new Error("DATABASE_URL missing — set Supabase pooled URL in .env");
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Seed keeps $0 free tier lean: 8 tops → 15 leaves → 3/leaf = ~45 products (~3MB)
// DEMO users for portfolio: admin/staff/customer with known password Yuyuneserx@1

async function main() {
  console.log("🌱 Seeding 8 tops → 15 leaves → 3/leaf (45 products) + demo users...");

  // Clear in FK order (children first)
  await db.repairStatusHistory.deleteMany();
  await db.repairJob.deleteMany();
  await db.inventoryLog.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  // Variants must be deleted before products (CASCADE would handle, but explicit)
  try {
    await (db as any).productVariant.deleteMany();
  } catch {}
  await db.product.deleteMany();
  await db.category.deleteMany();
  // Auth tables: Session/Account depend on User, Verification independent
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.verification.deleteMany();
  await db.user.deleteMany();

  const tops = [
    { name: "Laptops", slug: "laptops", children: ["Gaming Laptops", "Business Laptops"] },
    { name: "Desktops", slug: "desktops", children: ["Gaming Desktops", "Office Desktops"] },
    { name: "Components", slug: "components", children: ["CPU", "GPU", "RAM", "Storage", "Motherboard", "PSU / Case / Cooling"] },
    { name: "Peripherals", slug: "peripherals", children: ["Keyboard", "Mouse", "Headset"] },
    { name: "Monitors", slug: "monitors", children: [] },
    { name: "Networking", slug: "networking", children: ["Router", "Switch"] },
    { name: "Accessories", slug: "accessories", children: [] },
    { name: "Refurbished", slug: "refurbished", children: [] },
  ];

  const leafMap = new Map<string, string>();

  for (const top of tops) {
    const topCat = await db.category.create({
      data: { name: top.name, slug: top.slug, description: `${top.name} — top category` },
    });
    if (top.children.length === 0) {
      leafMap.set(top.name, topCat.id);
    } else {
      for (const child of top.children) {
        const c = await db.category.create({
          data: { name: child, slug: slug(`${top.slug}-${child}`), parentId: topCat.id, description: child },
        });
        leafMap.set(child, c.id);
      }
    }
  }

  console.log(`✅ Categories: ${leafMap.size} leaves, ${tops.length} tops`);

  const samples: Record<string, { prefix: string; price: number }[]> = {
    "Gaming Laptops": [{ prefix: "ASUS ROG Strix G15", price: 65000 }, { prefix: "Lenovo Legion 5", price: 58000 }, { prefix: "Acer Nitro 5", price: 42000 }],
    "Business Laptops": [{ prefix: "ThinkPad X1 Carbon", price: 72000 }, { prefix: "Dell XPS 13", price: 68000 }, { prefix: "HP EliteBook 840", price: 55000 }],
    "Gaming Desktops": [{ prefix: "Ryzen 7 RTX 4070 Build", price: 85000 }, { prefix: "i7 RTX 4060 Build", price: 70000 }, { prefix: "Budget Ryzen 5 GTX 1660", price: 38000 }],
    "Office Desktops": [{ prefix: "Dell Optiplex Office", price: 22000 }, { prefix: "Lenovo ThinkCentre", price: 25000 }, { prefix: "HP ProDesk Mini", price: 20000 }],
    CPU: [{ prefix: "Ryzen 5 5600", price: 8500 }, { prefix: "Ryzen 7 5700X", price: 13000 }, { prefix: "Intel i5 12400F", price: 9500 }],
    GPU: [{ prefix: "RTX 4060 8GB", price: 18000 }, { prefix: "RTX 4070 12GB", price: 32000 }, { prefix: "RX 6600 8GB", price: 13000 }],
    RAM: [{ prefix: "Corsair 16GB DDR4 3200", price: 2500 }, { prefix: "G.Skill 32GB DDR5 5600", price: 6500 }, { prefix: "Kingston 8GB DDR4", price: 1400 }],
    Storage: [{ prefix: "Samsung 970 EVO 1TB NVMe", price: 4500 }, { prefix: "WD Blue 500GB SSD", price: 2200 }, { prefix: "Seagate 1TB HDD", price: 1800 }],
    Motherboard: [{ prefix: "MSI B550M Pro", price: 5500 }, { prefix: "ASUS ROG Strix B650", price: 9500 }, { prefix: "Gigabyte H610M", price: 3800 }],
    "PSU / Case / Cooling": [{ prefix: "Corsair CV550 PSU", price: 2800 }, { prefix: "NZXT H510 Case", price: 4200 }, { prefix: "DeepCool AK400 Cooler", price: 1800 }],
    Keyboard: [{ prefix: "Keychron K2 Mechanical", price: 4500 }, { prefix: "Logitech K380", price: 1800 }, { prefix: "Razer BlackWidow", price: 5500 }],
    Mouse: [{ prefix: "Logitech G102", price: 900 }, { prefix: "Razer DeathAdder", price: 2500 }, { prefix: "Glorious Model O", price: 2800 }],
    Headset: [{ prefix: "HyperX Cloud II", price: 3500 }, { prefix: "Logitech G435", price: 3200 }, { prefix: "Razer Kraken", price: 2800 }],
    Monitors: [{ prefix: 'ASUS 24" 144Hz', price: 7500 }, { prefix: 'LG 27" 165Hz', price: 12500 }, { prefix: 'Dell 22" 75Hz', price: 4800 }],
    Router: [{ prefix: "TP-Link Archer AX73", price: 4500 }, { prefix: "ASUS RT-AX86U", price: 8500 }, { prefix: "MikroTik hAP ax3", price: 5500 }],
    Switch: [{ prefix: "TP-Link 8-Port Gigabit", price: 1200 }, { prefix: "Ubiquiti USW-Lite-8-PoE", price: 6500 }, { prefix: "Netgear GS108", price: 1500 }],
    Accessories: [{ prefix: "UGreen HDMI 2.0 2m", price: 350 }, { prefix: "Baseus USB-C Hub", price: 1200 }, { prefix: "Cable Management Kit", price: 250 }],
    Refurbished: [{ prefix: "Refurb ThinkPad T480", price: 15000 }, { prefix: "Refurb Dell 9020 i5", price: 9000 }, { prefix: 'Refurb HP 24" Monitor', price: 3500 }],
  };

  // Helper to create product with optional variants
  async function createProductWithVariants(opts: {
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: number;
    categoryId: string;
    images: string[];
    variants?: { label: string; sku: string; options: Record<string, string>; price: number; stockQty: number; image?: string }[];
  }) {
    const { variants, ...productData } = opts;
    const demoCount = variants ? variants.length : 0;
    // For parent with variants, price = min(variants), stock = sum
    const parentPrice = variants && variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : productData.price;
    const parentStock = variants && variants.length > 0 ? variants.reduce((s, v) => s + v.stockQty, 0) : (productData as any).stockQty || 10;
    const product = await db.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        description: productData.description,
        price: parentPrice,
        compareAtPrice: Math.round(parentPrice * 1.15),
        stockQty: parentStock,
        lowStockThreshold: 5,
        isActive: true,
        categoryId: productData.categoryId,
        images: productData.images,
      },
    });
    if (variants && variants.length > 0) {
      for (const v of variants) {
        const variant = await (db as any).productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            label: v.label,
            options: v.options,
            price: v.price,
            compareAtPrice: Math.round(v.price * 1.15),
            stockQty: v.stockQty,
            lowStockThreshold: 5,
            image: v.image || productData.images[0],
            isActive: true,
          },
        });
        await db.inventoryLog.create({
          data: { productId: product.id, variantId: variant.id, change: v.stockQty, reason: "INITIAL", note: `Seed variant ${v.label}` },
        });
      }
      // No parent inventory log when has variants (stock sum already in variants)
    } else {
      await db.inventoryLog.create({
        data: { productId: product.id, change: parentStock, reason: "INITIAL", note: "Seed initial stock" },
      });
    }
    return product;
  }

  let count = 0;
  let variantCount = 0;
  const demoImg = `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/sample`;

  // Define which leaves/products get variants (per your approval: Storage Seagate, RAM Corsair, Laptop color)
  const variantDefs: Record<string, { parentName: string; variants: { label: string; options: Record<string, string>; price: number }[] }[]> = {
    Storage: [
      {
        parentName: "Seagate Barracuda HDD",
        variants: [
          { label: "250GB", options: { capacity: "250GB" }, price: 1200 },
          { label: "500GB", options: { capacity: "500GB" }, price: 1800 },
          { label: "1TB", options: { capacity: "1TB" }, price: 2500 },
        ],
      },
    ],
    RAM: [
      {
        parentName: "Corsair Vengeance DDR4",
        variants: [
          { label: "8GB", options: { capacity: "8GB" }, price: 1400 },
          { label: "16GB", options: { capacity: "16GB" }, price: 2500 },
          { label: "32GB", options: { capacity: "32GB" }, price: 4800 },
        ],
      },
    ],
    "Gaming Laptops": [
      {
        parentName: "ASUS ROG Strix G15",
        variants: [
          { label: "Silver", options: { color: "Silver" }, price: 65000 },
          { label: "Black", options: { color: "Black" }, price: 65000 },
          { label: "Eclipse Gray", options: { color: "Eclipse Gray" }, price: 67000 },
        ],
      },
    ],
  };

  for (const [leaf, catId] of leafMap.entries()) {
    const items = samples[leaf];
    if (!items) {
      console.warn(`No samples for leaf "${leaf}" — skipping`);
      continue;
    }
    // Check if this leaf has variant parents
    const vParents = variantDefs[leaf];
    if (vParents && vParents.length > 0) {
      // Create variant parents + remaining singles to keep 3 parents per leaf
      const usedParentNames = new Set(vParents.map((v) => v.parentName));
      // First create variant parents
      for (const vp of vParents) {
        const sSlug = slug(`${vp.parentName}-${leaf}`.slice(0, 60));
        const sku = `SKU-${slug(leaf).toUpperCase().slice(0, 6)}-${String(count + 1).padStart(4, "0")}`;
        const variants = vp.variants.map((v, idx) => ({
          label: v.label,
          sku: `SKU-${slug(leaf).toUpperCase().slice(0, 6)}-${String(count + 1).padStart(4, "0")}-V${idx + 1}`,
          options: v.options,
          price: v.price,
          stockQty: 8 + Math.floor(Math.random() * 12),
        }));
        await createProductWithVariants({
          name: vp.parentName,
          slug: sSlug,
          sku,
          description: `${vp.parentName} — ${leaf} with variants ${vp.variants.map((v) => v.label).join(", ")}.`,
          price: 0, // will be min
          categoryId: catId,
          images: [demoImg, demoImg, demoImg],
          variants,
        });
        count++;
        variantCount += variants.length;
      }
      // Fill remaining slots to keep 3 parents per leaf (e.g., Storage already has Seagate parent, need 2 more singles)
      const remaining = items.filter((it) => !usedParentNames.has(it.prefix) && !vParents.some((vp) => vp.parentName === it.prefix));
      // For Storage, remaining are Samsung, WD (2) → need 2 singles to keep total 3 parents
      // For RAM, remaining are G.Skill, Kingston (but we used Corsair as variant parent, so remaining 2 singles)
      // For Gaming Laptops, remaining are Lenovo, Acer
      const neededSingles = 3 - vParents.length;
      for (let i = 0; i < Math.min(neededSingles, remaining.length); i++) {
        const s = remaining[i];
        const sSlug = slug(`${s.prefix}-${leaf}`.slice(0, 60));
        const sku = `SKU-${slug(leaf).toUpperCase().slice(0, 6)}-${String(count + 1).padStart(4, "0")}`;
        await createProductWithVariants({
          name: s.prefix,
          slug: sSlug,
          sku,
          description: `${s.prefix} — ${leaf}.`,
          price: s.price,
          categoryId: catId,
          images: [demoImg, demoImg, demoImg],
        });
        count++;
      }
    } else {
      // No variants for this leaf → 3 singles
      for (let i = 0; i < items.length; i++) {
        const s = items[i];
        const sSlug = slug(`${s.prefix}-${i}-${leaf}`.slice(0, 60));
        const sku = `SKU-${slug(leaf).toUpperCase().slice(0, 6)}-${String(count + 1).padStart(4, "0")}`;
        await createProductWithVariants({
          name: s.prefix,
          slug: sSlug,
          sku,
          description: `${s.prefix} — ${leaf}.`,
          price: s.price,
          categoryId: catId,
          images: [demoImg, demoImg, demoImg],
        });
        count++;
      }
    }
  }

  console.log(`✅ Products seeded: ${count} parents (3/leaf)`);
  console.log(`✅ Variants seeded: ${variantCount} (Seagate 3 + Corsair 3 + ASUS 3)`);
  const totalLogs = await db.inventoryLog.count();
  console.log(`✅ Inventory logs: ${totalLogs}`);

  // DEMO USERS for portfolio — password Yuyuneserx@1 (scrypt hash via @better-auth/utils)
  const demoPassword = "Yuyuneserx@1";
  const hash = await hashPassword(demoPassword);
  const now = new Date();
  const demos = [
    { name: "Stone Admin", email: "admin@stoneandcircuit.test", role: "ADMIN" as const, phone: "09123456789" },
    { name: "Stone Staff", email: "staff@stoneandcircuit.test", role: "STAFF" as const, phone: "09123456788" },
    { name: "Demo Customer", email: "customer@demo.test", role: "CUSTOMER" as const, phone: "09123456780" },
  ];

  for (const d of demos) {
    const userId = randomUUID();
    await db.user.create({
      data: {
        id: userId,
        name: d.name,
        email: d.email.toLowerCase(),
        emailVerified: true,
        image: null,
        role: d.role,
        phone: d.phone,
        createdAt: now,
        updatedAt: now,
      },
    });
    await db.account.create({
      data: {
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        issuer: "local:credential",
        userId,
        password: hash,
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log(`✅ Demo user: ${d.email} / ${demoPassword} (${d.role})`);
  }

  console.log("🌱 Done — portfolio ready: 45 products + 3 demo logins. Rotate demo password after showcase if needed.");
}

main()
  .then(async () => await db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
