"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

export default function PublicProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Product details
        const prodRes = await fetch("/api/admin/products");
        if (prodRes.ok) {
          const products = await prodRes.json();
          const currentProd = products.find(
            (p: any) => p.id.toString() === productId,
          );
          setProduct(currentProd);
        }

        // 2. Fetch Cards for this product
        const cardsRes = await fetch(
          `/api/admin/card-items?productId=${productId}`,
        );
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData.filter((c: any) => !c.deletedAt));
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchDetailData();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-medium">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <h1 className="text-2xl font-bold text-white">Product Not Found</h1>
        <Link
          href="/user/products"
          className="text-teal-400 hover:underline text-sm"
        >
          ← Back to All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/user/products"
          className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1"
        >
          ← Back to Products
        </Link>

        {/* Product Header Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 p-8 shadow-2xl flex flex-col justify-end min-h-[280px]">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="relative z-10 space-y-3">
            <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono rounded-full">
              {product.category?.name || "Category"}
            </span>
            <h1 className="text-4xl font-extrabold text-white">
              {product.title}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {product.description ||
                "No description provided for this product."}
            </p>
          </div>
        </div>

        {/* Dynamic Cards Section (3 Cards or more) */}
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Product Items & Features
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {cards.length} Cards Available
            </span>
          </div>

          {cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 hover:border-teal-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {card.imageUrl && (
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-40 object-cover rounded-xl border border-slate-800"
                      />
                    )}
                    <h3 className="text-lg font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {card.description || "No additional description."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 italic text-sm">
              No card items found for this product yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
