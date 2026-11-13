"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ================= HEADER ================= */}
      <section className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-3 max-w-2xl">
              <p className="text-teal-400 text-xs font-mono uppercase tracking-widest">
                Our Products
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {currentCategory ? currentCategory.name : "All Products"}
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Explore items under this category.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-teal-400 px-3.5 py-1.5 rounded-xl w-fit">
              {filteredProducts.length} Items Found
            </span>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/user/products"
              className={`px-4 py-2 rounded-full border text-xs font-semibold transition ${
                !selectedCategoryId
                  ? "bg-teal-500 border-teal-500 text-slate-950"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-teal-500/50 hover:text-teal-300"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/user/products?categoryId=${cat.id}`}
                className={`px-4 py-2 rounded-full border text-xs font-semibold transition ${
                  selectedCategoryId === cat.id.toString()
                    ? "bg-teal-500 border-teal-500 text-slate-950"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-teal-500/50 hover:text-teal-300"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCT GRID ================= */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item) => (
              <Link
                key={item.id}
                href={`/user/products/${item.id}`}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-teal-500/50 transition flex flex-col cursor-pointer"
              >
                {/* Image */}
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

                {/* Body */}
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
          <div className="text-center py-24 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 italic text-sm">
            No products found in this category.
          </div>
        )}
      </section>
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
