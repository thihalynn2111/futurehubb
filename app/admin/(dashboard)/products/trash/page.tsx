"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ProductTrashPage() {
  const [trashedCategories, setTrashedCategories] = useState<any[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<any[]>([]);
  const [trashedCards, setTrashedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all trashed items
  const fetchTrashData = async () => {
    try {
      // 1. Fetch categories and filter deletedAt
      const resCat = await fetch("/api/admin/categories");
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setTrashedCategories(dataCat.filter((c: any) => c.deletedAt));
      }

      // 2. Fetch product posts and filter deletedAt
      const resPost = await fetch("/api/admin/products");
      if (resPost.ok) {
        const dataPost = await resPost.json();
        setTrashedPosts(dataPost.filter((p: any) => p.deletedAt));
      }

      // 3. Fetch card items and filter deletedAt (adjust endpoint if needed)
      const resCard = await fetch("/api/admin/card-items");
      if (resCard.ok) {
        const dataCard = await resCard.json();
        setTrashedCards(dataCard.filter((card: any) => card.deletedAt));
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

  // --- RESTORE HANDLERS ---

  // 1. Restore Category (uses /api/admin/categories/[id]/restore with PATCH)
  const handleRestoreCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}/restore`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        alert("Category restored successfully! ✅");
        fetchTrashData();
      } else {
        alert("Failed to restore category");
      }
    } catch (err) {
      console.error("Error restoring category:", err);
    }
  };

  // 2. Restore Product Post (uses /api/admin/products/[id] with PUT)
  const handleRestorePost = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        alert("Product post restored successfully! ✅");
        fetchTrashData();
      } else {
        alert("Failed to restore product post");
      }
    } catch (err) {
      console.error("Error restoring post:", err);
    }
  };

  // 3. Restore Card Item (uses /api/admin/card-items/[id] with PUT)
  const handleRestoreCard = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/card-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        alert("Card item restored successfully! ✅");
        fetchTrashData();
      } else {
        alert("Failed to restore card item");
      }
    } catch (err) {
      console.error("Error restoring card:", err);
    }
  };

  // --- PERMANENT DELETE HANDLERS ---
  const handlePermanentDeleteCategory = async (id: number) => {
    if (!confirm("⚠️ Permanent delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) fetchTrashData();
  };

  const handlePermanentDeletePost = async (id: number) => {
    if (!confirm("⚠️ Permanent delete this product post?")) return;
    const res = await fetch(`/api/admin/products/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) fetchTrashData();
  };

  const handlePermanentDeleteCard = async (id: number) => {
    if (!confirm("⚠️ Permanent delete this card item?")) return;
    const res = await fetch(`/api/admin/card-items/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) fetchTrashData();
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">Loading trash bin...</div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-50/50 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Product Trash Bin
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Restore deleted categories, product posts, and card items, or
              delete them permanently.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            ← Back to Products Management
          </Link>
        </div>

        {/* 1. Trashed Categories Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            📂 Trashed Categories
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {trashedCategories.length > 0 ? (
                  trashedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {cat.deletedAt
                          ? new Date(cat.deletedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestoreCategory(cat.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer transition"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDeleteCategory(cat.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold cursor-pointer transition"
                        >
                          Delete Permanently
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-slate-400 text-xs"
                    >
                      No trashed categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Trashed Product Posts Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            📦 Trashed Product Posts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {trashedPosts.length > 0 ? (
                  trashedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {post.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {post.deletedAt
                          ? new Date(post.deletedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestorePost(post.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer transition"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDeletePost(post.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold cursor-pointer transition"
                        >
                          Delete Permanently
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-slate-400 text-xs"
                    >
                      No trashed product posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Trashed Card Items Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            🏷️ Trashed Card Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Card Title</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {trashedCards.length > 0 ? (
                  trashedCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {card.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {card.deletedAt
                          ? new Date(card.deletedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestoreCard(card.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer transition"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDeleteCard(card.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold cursor-pointer transition"
                        >
                          Delete Permanently
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-slate-400 text-xs"
                    >
                      No trashed card items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
