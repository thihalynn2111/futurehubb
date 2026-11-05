"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function TrashProductsPage() {
  const [trashedCategories, setTrashedCategories] = useState<any[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<any[]>([]);
  const [trashedCards, setTrashedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrashData = async () => {
    try {
      // 1. Categories
      const resCat = await fetch("/api/admin/categories");
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setTrashedCategories(
          dataCat.filter(
            (c: any) => c.deletedAt !== null && c.deletedAt !== undefined,
          ),
        );
      }

      // 2. Product Posts
      const resPost = await fetch("/api/admin/products");
      if (resPost.ok) {
        const dataPost = await resPost.json();
        setTrashedPosts(
          dataPost.filter(
            (p: any) => p.deletedAt !== null && p.deletedAt !== undefined,
          ),
        );
      }

      // 3. Card Items
      const resCard = await fetch("/api/admin/card-items");
      if (resCard.ok) {
        const dataCard = await resCard.json();
        setTrashedCards(
          dataCard.filter(
            (card: any) =>
              card.deletedAt !== null && card.deletedAt !== undefined,
          ),
        );
      }
    } catch (err) {
      console.error("Error fetching trash data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashData();
  }, []);

  // --- CATEGORY ACTIONS ---
  const handleRestoreCategory = async (id: number) => {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "PUT" });
    if (res.ok) {
      alert("Restored successfully!");
      fetchTrashData();
    }
  };
  const handlePermanentDeleteCategory = async (id: number) => {
    if (!confirm("⚠️ PERMANENT DELETE: Proceed?")) return;
    const res = await fetch(`/api/admin/categories/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Permanently deleted!");
      fetchTrashData();
    }
  };

  // --- PRODUCT POST ACTIONS ---
  const handleRestorePost = async (id: number) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "PUT" });
    if (res.ok) {
      alert("Restored successfully!");
      fetchTrashData();
    }
  };
  const handlePermanentDeletePost = async (id: number) => {
    if (!confirm("⚠️ PERMANENT DELETE: Proceed?")) return;
    const res = await fetch(`/api/admin/products/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Permanently deleted!");
      fetchTrashData();
    }
  };

  // --- CARD ITEM ACTIONS ---
  const handleRestoreCard = async (id: number) => {
    const res = await fetch(`/api/admin/card-items/${id}`, { method: "PUT" });
    if (res.ok) {
      alert("Card restored successfully!");
      fetchTrashData();
    }
  };
  const handlePermanentDeleteCard = async (id: number) => {
    if (!confirm("⚠️ PERMANENT DELETE: Proceed?")) return;
    const res = await fetch(`/api/admin/card-items/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Card permanently deleted!");
      fetchTrashData();
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">Loading trash bin...</div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Link
            href="/admin/products"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            ← Back to Products Management
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          🗑️ Trash Bin Management
        </h1>

        {/* 1. TRASHED CATEGORIES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">
            📂 Trashed Categories
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Deleted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {trashedCategories.length > 0 ? (
                trashedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold">{cat.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(cat.deletedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRestoreCategory(cat.id)}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteCategory(cat.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-slate-400">
                    No trashed categories.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. TRASHED PRODUCT POSTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">
            📦 Trashed Product Posts
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Deleted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {trashedPosts.length > 0 ? (
                trashedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold">{post.title}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(post.deletedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRestorePost(post.id)}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDeletePost(post.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-slate-400">
                    No trashed product posts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 3. TRASHED CARD ITEMS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">
            🃏 Trashed Card Items
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-3 px-4">Card Title</th>
                <th className="py-3 px-4">Parent Product</th>
                <th className="py-3 px-4">Deleted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {trashedCards.length > 0 ? (
                trashedCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold">
                      {card.title || "Untitled Card"}
                    </td>
                    <td className="py-3 px-4 text-blue-600">
                      {card.product?.title || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(card.deletedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRestoreCard(card.id)}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteCard(card.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-400">
                    No trashed card items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
