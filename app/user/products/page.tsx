"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ထုတ်ကုန်တစ်ခုရဲ့ စာမျက်နှာအပြည့်အစုံ (hero + features)
function ProductSection({ product, cards }: { product: any; cards: any[] }) {
  const half = Math.ceil(cards.length / 2);
  const leftCards = cards.slice(0, half);
  const rightCards = cards.slice(half);
  const hasCards = cards.length > 0;

  const renderFeatureCard = (card: any) => (
    <div
      key={card.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3 hover:border-teal-500/40 transition"
    >
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-12 h-12 object-cover rounded-lg border border-slate-800"
        />
      )}
      <h3 className="text-lg font-bold text-teal-400 underline underline-offset-4 decoration-teal-500/40">
        {card.title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {card.description || "No additional description."}
      </p>
    </div>
  );

  return (
    <section
      id={`product-${product.id}`}
      className="border-b border-slate-800 scroll-mt-24"
    >
      {/* Hero */}
      <div className="relative overflow-hidden">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

        <div
          className={`relative z-10 max-w-6xl mx-auto px-6 space-y-5 ${
            hasCards ? "py-10 md:py-14" : "py-8 md:py-10"
          }`}
        >
          <span className="inline-block px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono rounded-full">
            {product.category?.name || "Category"}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-3xl">
            {product.title}
          </h2>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">
            {product.description || "No description provided for this product."}
          </p>
        </div>
      </div>

      {/* Features (phone center layout) - cards ရှိမှသာ ပြမယ်၊ မရှိရင် နေရာမယူဘူး */}
      {hasCards && (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          <div className="text-center space-y-2">
            <p className="text-teal-400 text-xs font-mono uppercase tracking-widest">
              What's inside
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              Features of {product.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              {leftCards.map(renderFeatureCard)}
            </div>

            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative w-60 md:w-64 aspect-[9/19] rounded-[2.5rem] border-[10px] border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-950 rounded-full z-10" />
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center px-4 text-teal-400 font-bold">
                    {product.title}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 order-3">
              {rightCards.map(renderFeatureCard)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ProductsContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsByProduct, setCardsByProduct] = useState<Record<number, any[]>>(
    {},
  );
  const [cardsLoading, setCardsLoading] = useState(false);

  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories")
        .then((res) => res.json())
        .catch(() => []),
      fetch("/api/admin/products")
        .then((res) => res.json())
        .catch(() => []),
    ]).then(([catData, prodData]) => {
      if (Array.isArray(catData)) {
        // Oldest first (ID ascending): အဟောင်းအပေါ်၊ အသစ်အောက်
        const sortedCategories = [...catData].sort((a, b) => a.id - b.id);
        setCategories(sortedCategories);
      }
      if (Array.isArray(prodData)) {
        // Oldest first (ID ascending): အဟောင်းအပေါ်၊ အသစ်အောက်
        const sortedProducts = [...prodData].sort((a, b) => a.id - b.id);
        setProducts(sortedProducts);
      }
      setLoading(false);
    });
  }, []);

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId?.toString() === selectedCategoryId)
    : products;

  const filteredIds = filteredProducts.map((p) => p.id).join(",");

  useEffect(() => {
    if (loading || !selectedCategoryId || filteredProducts.length === 0) {
      return;
    }

    let cancelled = false;
    setCardsLoading(true);

    Promise.all(
      filteredProducts.map((p) =>
        fetch(`/api/admin/card-items?productId=${p.id}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => ({
            id: p.id,
            cards: Array.isArray(data)
              ? data.filter((c: any) => !c.deletedAt)
              : [],
          }))
          .catch(() => ({ id: p.id, cards: [] })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<number, any[]> = {};
      results.forEach((r) => {
        map[r.id] = r.cards;
      });
      setCardsByProduct(map);
      setCardsLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedCategoryId, filteredIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-medium">
        Loading...
      </div>
    );
  }

  return (
    // min-h-screen ဖယ်ထားတယ်: content အရွယ်အတိုင်း flexible ဖြစ်မယ်
    <div className="bg-slate-950 text-white">
      {/* ================= CATEGORY SELECTED: FULL PRODUCT PAGES ================= */}
      {selectedCategoryId ? (
        <>
          {filteredProducts.length === 0 ? (
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 italic text-sm">
                No products found in this category.
              </div>
            </div>
          ) : cardsLoading ? (
            <div className="py-20 text-center text-teal-400 font-medium">
              Loading...
            </div>
          ) : (
            <>
              {filteredProducts.map((item) => (
                <ProductSection
                  key={item.id}
                  product={item}
                  cards={cardsByProduct[item.id] || []}
                />
              ))}

              <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Let's talk about your new project
                  </h2>
                  <p className="text-slate-400 text-sm max-w-xl mx-auto">
                    Tell us what you need and our team will get back to you.
                  </p>
                  <Link
                    href="/user/contact"
                    className="inline-block bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 py-3 rounded-full transition shadow-lg text-sm"
                  >
                    Get in Touch ↗
                  </Link>
                </div>
              </section>
            </>
          )}
        </>
      ) : (
        /* ================= ALL: PRODUCT LIST ================= */
        <section className="max-w-7xl mx-auto px-6 py-12">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/user/products/${item.slug}`}
                  className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-teal-500/50 transition flex flex-col cursor-pointer"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-950/40">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-extrabold font-mono text-teal-500/30">
                        {item.title?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col">
                    {item.category?.name && (
                      <span className="w-fit px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-mono rounded-full">
                        {item.category.name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                      {item.description || "No description provided."}
                    </p>
                    <span className="text-teal-400 text-xs font-semibold pt-2">
                      Learn more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 italic text-sm">
              No products found.
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function PublicProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-teal-400 py-20">Loading page...</div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
