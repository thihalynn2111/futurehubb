"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ProductContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const urlProductId = searchParams.get("id");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Products Data:", data);
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          // URL ထဲမှာ id ပါလာရင် အဲ့ဒါကို ရွေးမယ်၊ မပါရင် ပထမဆုံးတစ်ခုကို ရွေးမယ်
          if (urlProductId) {
            setSelectedId(urlProductId);
          } else {
            setSelectedId(data[0].id.toString());
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [urlProductId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-medium">
        Loading products...
      </div>
    );
  }

  const currentProduct =
    products.find((p) => p.id.toString() === selectedId) || products[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header & Product Switcher Tabs */}
        <div className="text-center space-y-4">
          <span className="text-teal-400 font-semibold tracking-widest text-xs uppercase bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-full">
            PRODUCT SHOWCASE
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            {currentProduct ? currentProduct.title : "Explore Products"}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            {currentProduct?.description ||
              "Select a product below to view its specific details and info cards."}
          </p>

          {/* Product Tabs */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id.toString())}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition border ${
                  selectedId === p.id.toString()
                    ? "bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                📦 {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Product Main Bento Card */}
        {currentProduct ? (
          <div className="space-y-8">
            <div className="relative group rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl min-h-[400px] flex flex-col justify-end p-8 md:p-12">
              {currentProduct.imageUrl ? (
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

              <div className="absolute top-6 left-6 z-10">
                <span className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-teal-300 text-xs font-bold tracking-wider px-3.5 py-2 rounded-xl uppercase">
                  {currentProduct.category?.name || "PRODUCT"}
                </span>
              </div>

              <div className="relative z-10 space-y-3">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  {currentProduct.title}
                </h2>
                <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                  {currentProduct.description ||
                    "No description provided for this product."}
                </p>
              </div>
            </div>

            {/* Product Info Cards / Facts Section */}
            <div className="space-y-6 pt-6">
              <h3 className="text-xl font-extrabold text-teal-400 flex items-center gap-2">
                💡 Features & Info Cards ({currentProduct.cards?.length || 0})
              </h3>

              {currentProduct.cards && currentProduct.cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentProduct.cards.map((card: any, index: number) => (
                    <div
                      key={card.id}
                      className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 hover:border-teal-500/50 transition"
                    >
                      {card.imageUrl && (
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-full h-48 object-cover rounded-xl border border-slate-800"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-lg">
                          {card.title}
                        </h4>
                        <span className="text-slate-500 font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 italic text-sm">
                  No info cards added for this product yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
