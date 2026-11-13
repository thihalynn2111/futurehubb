"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

// 🚀 သင့် Folder ဖွဲ့စည်းပုံအတိုင်း _components ထဲက Layout တွေကို Import လုပ်ပါ
import CustomHrLayout from "./_components/customhr";
import GridGalleryLayout from "./_components/gridgallery";
import ZPatternLayout from "./_components/zpattern";
import SplitFocusLayout from "./_components/split";

export default function PublicProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);

        const prodRes = await fetch("/api/admin/products");
        if (prodRes.ok) {
          const products = await prodRes.json();
          const currentProd = products.find((p: any) => p.slug === slug);
          setProduct(currentProd);

          if (currentProd) {
            const cardsRes = await fetch(
              `/api/admin/card-items?productId=${currentProd.id}`,
            );
            if (cardsRes.ok) {
              const cardsData = await cardsRes.json();
              setCards(cardsData.filter((c: any) => !c.deletedAt));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDetailData();
    }
  }, [slug]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-medium">
        Loading product details...
      </div>
    );
  }

  // Not Found State
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

  // ==========================================
  // 🚀 ADMIN မှာ ရွေးချယ်လိုက်တဲ့ TYPE အလိုက် LAYOUT ခွဲခြားခြင်း
  // ==========================================

  if (product.type === "custom-hr") {
    return <CustomHrLayout product={product} cards={cards} />;
  }

  if (product.type === "grid-gallery") {
    return <GridGalleryLayout product={product} cards={cards} />;
  }

  if (product.type === "z-pattern") {
    return <ZPatternLayout product={product} cards={cards} />;
  }

  if (product.type === "split-focus") {
    return <SplitFocusLayout product={product} cards={cards} />;
  }

  // ==========================================
  // 🟢 FALLBACK (အကယ်၍ Type မှားယွင်းနေရင် သို့မဟုတ် မထည့်ရသေးရင် ပြမယ့်ပုံစံ)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
      <p className="text-xl font-bold">
        No layout specified for this product type.
      </p>
      <p className="text-sm">
        Current Type:{" "}
        <span className="font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
          {product.type || "none"}
        </span>
      </p>
      <Link href="/user/products" className="text-blue-500 hover:underline">
        ← Back to Products
      </Link>
    </div>
  );
}
