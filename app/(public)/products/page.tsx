"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link"; // 🔥 Link ကို import လုပ်ပါ

function ProductsContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(prodData)) setProducts(prodData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-medium">
        Loading...
      </div>
    );
  }

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId?.toString() === selectedCategoryId)
    : products;

  const currentCategory = categories.find(
    (c) => c.id.toString() === selectedCategoryId,
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {currentCategory ? currentCategory.name : "All Products"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore items under this category.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-teal-400 px-3.5 py-1.5 rounded-xl">
            {filteredProducts.length} Items Found
          </span>
        </div>

        {/* Bento Grid (Product Cards Area) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => (
              /* 🔥 Product Card ကို Link ဖြင့် ခြုံပေးခြင်းအားဖြင့် နှိပ်လို့ရသွားပါမည် */
              <Link
                key={item.id}
                href={`/products/${item.id}`} // နှိပ်လိုက်လျှင် ဤ Product ၏ detail/cards စာမျက်နှာသို့ သွားမည်
                className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4 hover:border-teal-500/50 transition flex flex-col justify-end min-h-[320px] group cursor-pointer"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-teal-400 transition">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-xs line-clamp-2">
                    {item.description || "No description provided."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 italic text-sm">
            No products found in this category.
          </div>
        )}
      </div>
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
