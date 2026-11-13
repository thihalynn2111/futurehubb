"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ProductTrashPage() {
  const [trashedCategories, setTrashedCategories] = useState<any[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<any[]>([]);
  const [trashedCards, setTrashedCards] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all trashed items & Auth permissions
  const fetchTrashData = async () => {
    try {
      setLoading(true);

      // 0. Fetch user auth & permissions (Super Admin & Matrix support)
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) {
          setUserRoles(meData.user.roles || []);
          setUserPermissions(meData.user.permissions || []);
        }
      }

      // 1. Fetch trashed categories
      const resCat = await fetch("/api/admin/categories?trash=true");
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setTrashedCategories(dataCat);
      }

      // 2. Fetch trashed product posts
      const resPost = await fetch("/api/admin/products?trash=true");
      if (resPost.ok) {
        const dataPost = await resPost.json();
        setTrashedPosts(dataPost);
      }

      // 3. Fetch trashed card items
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

  // 🔑 Universal Permission Matrix Engine
  const isSuperAdmin = userRoles.some(
    (role) =>
      role.toLowerCase().includes("super") || role.toLowerCase() === "admin",
  );

  const hasPermission = (permissionKey: string) => {
    return isSuperAdmin || userPermissions.includes(permissionKey);
  };

  // Permissions for Trash Bin (Restore = update, Permanent Delete = delete)
  const canUpdateCategories =
    hasPermission("categories:update") || hasPermission("products:update");
  const canDeleteCategories =
    hasPermission("categories:delete") || hasPermission("products:delete");

  const canUpdatePosts =
    hasPermission("posts:update") || hasPermission("products:update");
  const canDeletePosts =
    hasPermission("posts:delete") || hasPermission("products:delete");

  const canUpdateCards =
    hasPermission("cards:update") || hasPermission("products:update");
  const canDeleteCards =
    hasPermission("cards:delete") || hasPermission("products:delete");

  // --- RESTORE HANDLERS ---
  const handleRestoreCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }), // 🚀 ဤနေရာတွင် restore: true ထည့်သွင်းပေးထားပါသည်
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
                        {canUpdateCategories && (
                          <button
                            onClick={() => handleRestoreCategory(cat.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer transition"
                          >
                            Restore
                          </button>
                        )}
                        {canDeleteCategories && (
                          <button
                            onClick={() =>
                              handlePermanentDeleteCategory(cat.id)
                            }
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold cursor-pointer transition"
                          >
                            Delete Permanently
                          </button>
                        )}
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
                  <th className="py-3 px-4">Category</th>
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
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">
                          {post.category?.name || "N/A"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {post.deletedAt
                          ? new Date(post.deletedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {canUpdatePosts && (
                          <button
                            onClick={() => handleRestorePost(post.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer transition"
                          >
                            Restore
                          </button>
                        )}
                        {canDeletePosts && (
                          <button
                            onClick={() => handlePermanentDeletePost(post.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold cursor-pointer transition"
                          >
                            Delete Permanently
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
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
                  <th className="py-3 px-4">Parent Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {trashedCards.length > 0 ? (
                  trashedCards.map((card) => {
                    const parentPost = card.product || card.productPost;
                    const parentCategory = parentPost?.category;

                    return (
                      <tr key={card.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {card.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg font-bold">
                            {parentPost?.title || "N/A"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">
                            {parentCategory?.name || "N/A"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {card.deletedAt
                            ? new Date(card.deletedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {canUpdateCards && (
                            <button
                              onClick={() => handleRestoreCard(card.id)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer transition"
                            >
                              Restore
                            </button>
                          )}
                          {canDeleteCards && (
                            <button
                              onClick={() => handlePermanentDeleteCard(card.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold cursor-pointer transition"
                            >
                              Delete Permanently
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
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
