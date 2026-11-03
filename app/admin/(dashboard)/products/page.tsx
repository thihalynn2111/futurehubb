"use client";

import React, { useState, useEffect } from "react";

export default function AdminProductsManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form 1: Category
  const [catName, setCatName] = useState("");

  // Form 2: Product Post
  const [prodTitle, setProdTitle] = useState("");
  const [prodCatId, setProdCatId] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImage, setProdImage] = useState("");

  // Form 3: Card Item (Info & Pic for Product)
  const [selectedProductId, setSelectedProductId] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [cardImage, setCardImage] = useState("");

  const loadData = async () => {
    const catRes = await fetch("/api/admin/categories").then((r) => r.json());
    const prodRes = await fetch("/api/admin/products").then((r) => r.json());
    if (Array.isArray(catRes)) setCategories(catRes);
    if (Array.isArray(prodRes)) {
      setProducts(prodRes);
      if (prodRes.length > 0 && !selectedProductId)
        setSelectedProductId(prodRes[0].id.toString());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName }),
    });
    setCatName("");
    loadData();
    alert("Category Created!");
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: prodTitle,
        categoryId: prodCatId,
        description: prodDesc,
        imageUrl: prodImage,
      }),
    });
    setProdTitle("");
    setProdDesc("");
    setProdImage("");
    loadData();
    alert("Product Created!");
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/card-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        title: cardTitle,
        description: cardDesc,
        imageUrl: cardImage,
      }),
    });
    setCardTitle("");
    setCardDesc("");
    setCardImage("");
    loadData();
    alert("Card Info Added to Product!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">
        ⚙️ Product & Info Management Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Create Category */}
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-bold text-lg">1. Create Category</h2>
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <input
              type="text"
              placeholder="Category Name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-bold"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* 2. Create Product Post */}
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-bold text-lg">2. Create Product Name</h2>
          <form onSubmit={handleCreateProduct} className="space-y-3">
            <select
              value={prodCatId}
              onChange={(e) => setProdCatId(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Product Title"
              value={prodTitle}
              onChange={(e) => setProdTitle(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded font-bold"
            >
              Save Product
            </button>
          </form>
        </div>

        {/* 3. Add Card Info to Product */}
        <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-bold text-lg">3. Add Info/Pic to Product</h2>
          <form onSubmit={handleCreateCard} className="space-y-3">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 font-bold"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  📦 {p.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Info Title (e.g. Specification)"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
            <input
              type="text"
              placeholder="Card Image URL"
              value={cardImage}
              onChange={(e) => setCardImage(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
            />
            <textarea
              placeholder="Info Description"
              value={cardDesc}
              onChange={(e) => setCardDesc(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              rows={2}
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded font-bold"
            >
              Add Card Item
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
