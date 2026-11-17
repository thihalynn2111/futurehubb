"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

// 🚀 သင့် Folder ဖွဲ့စည်းပုံအတိုင်း Layout တွေကို Import လုပ်ပါ
import CustomHrLayout from "../../[slug]/_components/customhr";
import GridGalleryLayout from "../../[slug]/_components/gridgallery";
import ZPatternLayout from "../../[slug]/_components/zpattern";
import SplitFocusLayout from "../../[slug]/_components/split";
import GlassHeroLayout from "../../[slug]/_components/glasshero";

export default function CategoryProductsPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.categorySlug;

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsByProduct, setCardsByProduct] = useState<Record<number, any[]>>(
    {},
  );
  const [cardsLoading, setCardsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories")
        .then((res) => res.json())
        .catch(() => []),
      fetch("/api/admin/products")
        .then((res) => res.json())
        .catch(() => []),
    ]).then(([catData, prodData]) => {
      // Oldest first (ID ascending): အဟောင်းအပေါ်၊ အသစ်အောက်
      if (Array.isArray(catData))
        setCategories([...catData].sort((a, b) => a.id - b.id));
      if (Array.isArray(prodData))
        setProducts([...prodData].sort((a, b) => a.id - b.id));
      setLoading(false);
    });
  }, []);

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  const filteredProducts = currentCategory
    ? products.filter((p) => p.categoryId === currentCategory.id)
    : [];

  const filteredIds = filteredProducts.map((p) => p.id).join(",");

  // Cards တွေကို ဆွဲထုတ်မယ်
  useEffect(() => {
    if (loading || filteredProducts.length === 0) return;

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
  }, [loading, filteredIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-medium">
        Loading category...
      </div>
    );
  }

  return (
    // Navbar အောက်ကနေ ချက်ချင်း စပါမယ်။ min-h-screen မပါဘူး (content အရွယ်အတိုင်း)
    <div className="w-full bg-slate-950 text-white pb-12">
      {/* PRODUCT LIST (Type အလိုက် Layout ခွဲပြမယ်) */}
      {filteredProducts.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 italic text-sm">
            No products found in this category.
          </div>
        </div>
      ) : cardsLoading ? (
        <div className="py-20 text-center text-teal-400 font-medium">
          Loading products...
        </div>
      ) : (
        <div className="space-y-0">
          {filteredProducts.map((item) => {
            const productCards = cardsByProduct[item.id] || [];

            return (
              <div
                key={item.id}
                className="border-b border-slate-800 last:border-0"
              >
                {item.type === "custom-hr" && (
                  <CustomHrLayout product={item} cards={productCards} />
                )}
                {item.type === "grid-gallery" && (
                  <GridGalleryLayout product={item} cards={productCards} />
                )}
                {item.type === "z-pattern" && (
                  <ZPatternLayout product={item} cards={productCards} />
                )}
                {item.type === "split-focus" && (
                  <SplitFocusLayout product={item} cards={productCards} />
                )}
                {item.type === "glass-hero" && (
                  <GlassHeroLayout product={item} cards={productCards} />
                )}

                {![
                  "custom-hr",
                  "grid-gallery",
                  "z-pattern",
                  "split-focus",
                  "glass-hero",
                ].includes(item.type) && (
                  <div className="py-20 text-center text-slate-500">
                    No specific layout for this product (Type:{" "}
                    {item.type || "none"})
                  </div>
                )}
              </div>
            );
          })}

          {/* Call to Action */}
          <section className="max-w-6xl mx-auto px-6 py-12">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 md:p-14 text-center space-y-5">
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
        </div>
      )}
    </div>
  );
}
