import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { toggleProductActive, updateProductStock } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { category: { select: { name: true, slug: true } } },
    });
  } catch {
    return <div className="text-sm text-zinc-500">DB not configured — set DATABASE_URL then rebuild.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Products — {products.length} (admin)</h1>
        <Link href="/admin/products/new" className="rounded-full bg-black px-4 py-2 text-xs text-white dark:bg-white dark:text-black">
          + New Product
        </Link>
      </div>
      <p className="text-xs text-zinc-500">Stock adjusts create InventoryLog. Toggle active hides from storefront.</p>

      <div className="mt-4 overflow-auto rounded-2xl border dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs dark:bg-zinc-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">Active</th>
              <th className="p-3 text-right">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cat = (p as unknown as { category: { name: string } }).category;
              return (
                <tr key={p.id} className="border-t dark:border-zinc-800">
                  <td className="p-3">
                    <Link href={`/products/${p.slug}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-xs text-zinc-500">{p.sku}</div>
                  </td>
                  <td className="p-3">{cat?.name}</td>
                  <td className="p-3 text-right">{formatPrice(Number((p as unknown as { price: unknown }).price))}</td>
                  <td className="p-3 text-center">
                    <span className={p.stockQty <= p.lowStockThreshold ? "text-red-600 font-semibold" : ""}>{p.stockQty}</span>
                    {p.stockQty <= p.lowStockThreshold && <span className="ml-1 text-xs text-red-600">LOW</span>}
                  </td>
                  <td className="p-3 text-center">
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button variant={p.isActive ? "default" : "outline"} size="sm">
                        {p.isActive ? "On" : "Off"}
                      </Button>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <form action={updateProductStock}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value="-1" />
                        <input type="hidden" name="reason" value="ADJUSTMENT" />
                        <Button size="sm" variant="outline">
                          −1
                        </Button>
                      </form>
                      <form action={updateProductStock}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value="5" />
                        <input type="hidden" name="reason" value="RESTOCK" />
                        <Button size="sm" variant="outline">
                          +5
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="mt-4 text-sm text-zinc-500">No products — seed or create one.</p>}
    </div>
  );
}
