import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart";

// Vibecode learning: Dynamic route [slug] — Server Component fetches one product.
// - generateMetadata would use same query for SEO.
// - Images from Cloudinary Json. No extra cost — stored as URLs.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const p = await db.product.findUnique({ where: { slug }, select: { name: true, description: true } });
    if (!p) return {};
    return { title: p.name, description: p.description.slice(0, 150) };
  } catch {
    return {};
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Awaited<ReturnType<typeof db.product.findUnique>> & { category?: { name: string; slug: string } } | null = null;
  try {
    product = await db.product.findUnique({
      where: { slug },
      include: { category: { select: { name: true, slug: true } } },
    });
  } catch {
    return <div className="p-8 text-sm text-zinc-500">DB not configured — set DATABASE_URL in .env</div>;
  }
  if (!product) notFound();

  const imgs = Array.isArray(product.images) ? (product.images as string[]) : [];
  const price = Number((product as unknown as { price: unknown }).price);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice as unknown as number) : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden border bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs[0] || "https://res.cloudinary.com/demo/image/upload/w_800/sample"} alt={product.name} className="h-full w-full object-cover" />
        </div>
        {imgs.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {imgs.slice(1, 4).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="rounded-xl border aspect-square object-cover dark:border-zinc-800" />
            ))}
          </div>
        )}
      </div>

      <div>
        <Link href={`/products?cat=${product.category?.slug}`} className="text-xs uppercase tracking-widest text-zinc-500">
          {product.category?.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
        <p className="text-xs text-zinc-500">SKU: {product.sku} • Stock: {product.stockQty}</p>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold">{formatPrice(price)}</span>
          {compare && <span className="text-sm line-through text-zinc-400">{formatPrice(compare)}</span>}
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{product.description}</p>

        <div className="mt-6">
          <AddToCartButton product={{ id: product.id, name: product.name, price, slug: product.slug, image: imgs[0] }} stock={product.stockQty} />
        </div>

        <div className="mt-6 rounded-2xl border p-4 text-xs text-zinc-500 dark:border-zinc-800">
          <p>Free tier: images on Cloudinary (25GB free), DB row ~2KB. COD checkout via /cart → /checkout.</p>
          <Link href="/products" className="underline">
            ← Back to catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
