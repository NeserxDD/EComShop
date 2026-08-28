import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) throw new Error("DATABASE_URL missing — set Supabase pooled URL in .env");
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Vibecode learning: Seed keeps $0 free tier lean.
// - 8 tops, 15 leaves, 3 per leaf = ~45 products. Each ~2KB row = ~90KB + indexes = ~3MB.
// - Images are Cloudinary URLs (not blobs) — 45×3 thumbs ≈ 30MB on Cloudinary, 0MB on Supabase.

async function main() {
  console.log("🌱 Seeding 8 tops → 15 leaves → 3/leaf (45 products)...");

  // Clear in dependency order
  await db.repairStatusHistory.deleteMany();
  await db.repairJob.deleteMany();
  await db.inventoryLog.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();

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

  const leafMap = new Map<string, string>(); // leaf name → categoryId

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

  // Sample products: 3 per leaf with realistic pricing, SKU, images (placeholder Cloudinary demo URLs)
  // In prod replace with your Cloudinary upload URLs.
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
    Refurbished: [{ prefix: "Refurb ThinkPad T480", price: 15000 }, { prefix: "Refurb Dell 9020 i5", price: 9000 }, { prefix: "Refurb HP 24\" Monitor", price: 3500 }],
  };

  let count = 0;
  for (const [leaf, catId] of leafMap.entries()) {
    const items = samples[leaf];
    if (!items) {
      console.warn(`No samples for leaf "${leaf}" — skipping`);
      continue;
    }
    for (let i = 0; i < items.length; i++) {
      const s = items[i];
      const name = s.prefix;
      const sSlug = slug(`${s.prefix}-${i}-${leaf}`.slice(0, 60));
      const sku = `SKU-${slug(leaf).toUpperCase().slice(0, 6)}-${String(count + 1).padStart(4, "0")}`;
      // Placeholder Cloudinary demo: replace with real upload via /admin
      const demoImg = `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/sample`; // demo cloud, free
      await db.product.create({
        data: {
          name,
          slug: sSlug,
          sku,
          description: `${name} — ${leaf}. Reliable, warranty included. Category: ${leaf}. Placeholder description for seed; edit in /admin.`,
          price: s.price,
          compareAtPrice: Math.round(s.price * 1.15),
          stockQty: 10 + Math.floor(Math.random() * 20),
          lowStockThreshold: 5,
          isActive: true,
          categoryId: catId,
          images: [demoImg, demoImg, demoImg], // Json array
        },
      });
      // Initial inventory log
      // (we would create after product, but need productId — so fetch last created? Instead use create with connect after)
      count++;
    }
  }

  // Create inventory logs for each product (INITIAL)
  const prods = await db.product.findMany({ select: { id: true, stockQty: true } });
  for (const p of prods) {
    await db.inventoryLog.create({
      data: { productId: p.id, change: p.stockQty, reason: "INITIAL", note: "Seed initial stock" },
    });
  }

  console.log(`✅ Products seeded: ${count} (3/leaf)`);
  console.log(`✅ Inventory logs: ${prods.length}`);
  console.log("🌱 Done — free tier usage: ~3MB DB, ~30MB Cloudinary (demo). Replace demo images via Cloudinary upload.");
}

main()
  .then(async () => await db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
