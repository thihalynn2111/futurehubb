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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-slate-800">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 space-y-6">
          <Link
            href="/user/products"
            className="text-xs text-teal-400 hover:underline font-semibold inline-flex items-center gap-1"
          >
            ← Back to Products
          </Link>

          <div className="space-y-5 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono rounded-full">
              {product.category?.name || "Category"}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              {product.title}
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              {product.description ||
                "No description provided for this product."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/user/contact"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-full transition shadow-lg text-sm"
            >
              Get in Touch ↗
            </Link>
            {cards.length > 0 && (
              <a
                href="#features"
                className="border border-slate-700 hover:border-teal-500/60 text-slate-200 hover:text-teal-300 font-semibold px-6 py-3 rounded-full transition text-sm"
              >
                See Features ↓
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ================= FEATURE OVERVIEW ================= */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-6 pt-16 pb-6 space-y-8 scroll-mt-24"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <p className="text-teal-400 text-xs font-mono uppercase tracking-widest">
              What's inside
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Features of {product.title}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 w-fit">
            {cards.length} Features
          </span>
        </div>

        {cards.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cards.map((card, index) => (
              <a
                key={card.id}
                href={`#card-${card.id}`}
                className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:text-teal-300 text-slate-300 text-xs font-medium transition"
              >
                <span className="text-teal-400 font-mono mr-2">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {card.title}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ================= FEATURE ROWS ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-8">
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <div
              key={card.id}
              id={`card-${card.id}`}
              className={`scroll-mt-24 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:border-teal-500/40 transition flex flex-col ${
                index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {/* Image / Number side */}
              <div className="md:w-1/2 bg-slate-950/40 flex items-center justify-center min-h-[240px]">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full max-h-[360px] object-cover"
                  />
                ) : (
                  <span className="text-7xl font-extrabold font-mono text-teal-500/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Text side */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-4">
                <span className="text-teal-400 text-sm font-mono">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {card.description || "No additional description."}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 italic text-sm">
            No card items found for this product yet.
          </div>
        )}
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 md:p-14 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Let's talk about your new project
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Interested in {product.title}? Tell us what you need and our team
            will get back to you.
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
  );
}
