import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart";
import { VariantPicker } from "./variant-picker";

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
  let product: any | null = null;
  try {
    product = await db.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      },
    });
  } catch {
    return <div className="p-8 text-sm text-muted-foreground">DB not configured — set DATABASE_URL in .env</div>;
  }
  if (!product) notFound();

  const imgs = Array.isArray(product.images) ? (product.images as string[]) : [];
  const variants = (product.variants || []) as any[];
  const hasVariants = variants.length > 0;
  const price = Number(product.price);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs[0] || "https://res.cloudinary.com/demo/image/upload/w_800/sample"} alt={product.name} className="h-full w-full object-cover" />
        </div>
        {imgs.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {imgs.slice(1, 4).map((src: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="rounded-xl border border-border aspect-square object-cover" />
            ))}
          </div>
        )}
      </div>

      <div>
        <Link href={`/products?cat=${product.category?.slug}`} className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          {product.category?.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
          {product.name}
        </h1>
        {!hasVariants && <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">SKU: {product.sku} · Stock: {product.stockQty}</p>}

        {!hasVariants ? (
          <>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold">{formatPrice(price)}</span>
              {compare && <span className="text-sm line-through text-muted-foreground">{formatPrice(compare)}</span>}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.description}</p>
            <div className="mt-6">
              <AddToCartButton product={{ id: product.id, name: product.name, price, slug: product.slug, image: imgs[0] }} stock={product.stockQty} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.description}</p>
            <div className="mt-6">
              <VariantPicker
                product={{ id: product.id, name: product.name, slug: product.slug }}
                variants={variants.map((v: any) => ({
                  id: v.id,
                  label: v.label,
                  sku: v.sku,
                  price: Number(v.price),
                  stockQty: v.stockQty,
                  options: v.options as Record<string, string>,
                  image: v.image,
                }))}
                basePrice={price}
                baseStock={product.stockQty}
                baseImage={imgs[0]}
              />
            </div>
          </>
        )}

        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
          <p>Stone & Circuit — Genuine parts, warranty included. COD via /cart → /checkout.</p>
          <Link href="/products" className="underline">
            ← Back to catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
