import { notFound } from "next/navigation";
import Link from "next/link";

// Data ဆွဲထုတ်မယ့် Function များ
async function getProductBySlug(slug: string) {
  const res = await fetch(`http://localhost:3000/api/admin/products`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const products = await res.json();
  return products.find((p: any) => p.slug === slug);
}

async function getProductCards(productId: number) {
  const res = await fetch(
    `http://localhost:3000/api/admin/card-items?productId=${productId}`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.filter((c: any) => !c.deletedAt) : [];
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return notFound();
  }

  const cards = await getProductCards(product.id);

  // ==========================================
  // 🚀 CUSTOM LAYOUT (Future HR ကဲ့သို့ ပုံစံမျိုးအတွက်)
  // ==========================================
  if (product.type === "custom-hr") {
    const half = Math.ceil(cards.length / 2);
    const leftCards = cards.slice(0, half);
    const rightCards = cards.slice(half);

    return (
      <div className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Link
            href="/user/products"
            className="text-teal-400 hover:underline text-sm mb-8 inline-block"
          >
            ← Back to Products
          </Link>

          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold">
              {product.title}
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Column */}
            <div className="space-y-6 order-2 lg:order-1">
              {leftCards.map((card: any) => (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3"
                >
                  <h3 className="text-lg font-bold text-teal-400">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{card.description}</p>
                </div>
              ))}
            </div>

            {/* Center Phone Mockup */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative w-60 md:w-64 aspect-[9/19] rounded-[2.5rem] border-[10px] border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-400 font-bold">
                    {product.title}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 order-3">
              {rightCards.map((card: any) => (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3"
                >
                  <h3 className="text-lg font-bold text-teal-400">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟢 STANDARD LAYOUT (ကျန်တဲ့ Product တွေအတွက်)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <Link
          href="/user/products"
          className="text-blue-600 text-sm mb-4 inline-block"
        >
          ← Back to Products
        </Link>

        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {product.title}
        </h1>
        <p className="text-slate-500 font-mono text-sm mb-6">
          Type: {product.type}
        </p>

        <div className="prose max-w-none">
          {/* Content ရှိရင် Content ပြ၊ မရှိရင် Description ပြ */}
          <p>{product.content || product.description || "No description."}</p>
        </div>

        {cards.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card: any) => (
                <div
                  key={card.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                >
                  <h3 className="font-bold text-slate-800">{card.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
