"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Creation States
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [postCategoryId, setPostCategoryId] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postDesc, setPostDesc] = useState("");

  const [cardPostId, setCardPostId] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [cardImage, setCardImage] = useState("");

  // Edit States
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");

  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostSlug, setEditPostSlug] = useState("");
  const [editPostCatId, setEditPostCatId] = useState("");
  const [editPostImage, setEditPostImage] = useState("");
  const [editPostDesc, setEditPostDesc] = useState("");

  const fetchData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) {
          setUserRoles(meData.user.roles || []);
          setUserPermissions(meData.user.permissions || []);
        }
      }

      const resCat = await fetch("/api/admin/categories");
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategories(dataCat.filter((c: any) => !c.deletedAt));
      }

      const resPost = await fetch("/api/admin/products");
      if (resPost.ok) {
        const dataPost = await resPost.json();
        setPosts(dataPost.filter((p: any) => !p.deletedAt));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔑 Super Admin Bypass & Permission Checker
  const isSuperAdmin = userRoles.some((role) => {
    const r = role.toLowerCase().replace(/[\s_-]/g, "");
    return (
      r.includes("superadmin") || r === "admin" || r === "superadministrator"
    );
  });

  const hasPermission = (permissionKey: string) => {
    return isSuperAdmin || userPermissions.includes(permissionKey);
  };

  // 🌟 Unified Products Permissions Matrix
  const canReadProducts = hasPermission("products:read");
  const canCreateProducts = hasPermission("products:create");
  const canUpdateProducts = hasPermission("products:update");
  const canDeleteProducts = hasPermission("products:delete");

  // Sub-sections mapped directly to unified permissions
  const canReadCategories = canReadProducts;
  const canCreateCategories = canCreateProducts;
  const canUpdateCategories = canUpdateProducts;
  const canDeleteCategories = canDeleteProducts;

  const canCreateCards = canCreateProducts; // 👈 Create ဖြုတ်လိုက်လျှင် Card Form ပါ ပိတ်သွားမည်

  // --- CATEGORY ACTIONS ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return alert("Please enter category name");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, "-"),
      }),
    });

    if (res.ok) {
      alert("Category created successfully!");
      setCatName("");
      setCatSlug("");
      fetchData();
    } else {
      alert("Failed to create category");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editCatName, slug: editCatSlug }),
    });

    if (res.ok) {
      alert("Category updated successfully!");
      setEditingCategory(null);
      fetchData();
    } else {
      alert("Failed to update category");
    }
  };

  const handleSoftDeleteCategory = async (id: number) => {
    if (!confirm("Move this category to trash?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Category moved to trash!");
      fetchData();
    } else {
      alert("Failed to trash category");
    }
  };

  const handlePermanentDeleteCategory = async (id: number) => {
    if (!confirm("⚠️ PERMANENT DELETE: This cannot be undone. Proceed?"))
      return;
    const res = await fetch(`/api/admin/categories/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Category permanently deleted!");
      fetchData();
    } else {
      alert("Failed to permanently delete category");
    }
  };

  // --- PRODUCT POST ACTIONS ---
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postCategoryId)
      return alert("Please fill title and select category");

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: postTitle,
        slug: postTitle.toLowerCase().replace(/\s+/g, "-"),
        categoryId: Number(postCategoryId),
        imageUrl: postImage,
        description: postDesc,
      }),
    });

    if (res.ok) {
      alert("Product Post created successfully!");
      setPostTitle("");
      setPostCategoryId("");
      setPostImage("");
      setPostDesc("");
      fetchData();
    } else {
      alert("Failed to create product post");
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const res = await fetch(`/api/admin/products/${editingPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editPostTitle,
        slug: editPostSlug || editPostTitle.toLowerCase().replace(/\s+/g, "-"),
        categoryId: Number(editPostCatId),
        imageUrl: editPostImage,
        description: editPostDesc,
      }),
    });

    if (res.ok) {
      alert("Product Post updated successfully!");
      setEditingPost(null);
      fetchData();
    } else {
      alert("Failed to update product post");
    }
  };

  const handleSoftDeletePost = async (id: number) => {
    if (!confirm("Move this product post to trash?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Product post moved to trash!");
      fetchData();
    } else {
      alert("Failed to trash product post");
    }
  };

  const handlePermanentDeletePost = async (id: number) => {
    if (
      !confirm(
        "⚠️ PERMANENT DELETE: This will delete the post and its cards permanently. Proceed?",
      )
    )
      return;
    const res = await fetch(`/api/admin/products/${id}?permanent=true`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Product post permanently deleted!");
      fetchData();
    } else {
      alert("Failed to permanently delete product post");
    }
  };

  // --- CARD ITEM ACTION ---
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardPostId || !cardTitle)
      return alert("Please select product post and enter card title");

    const res = await fetch("/api/admin/card-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(cardPostId),
        title: cardTitle,
        description: cardDesc,
        imageUrl: cardImage,
      }),
    });

    if (res.ok) {
      alert("Card Item added successfully!");
      setCardPostId("");
      setCardTitle("");
      setCardDesc("");
      setCardImage("");
      fetchData();
    } else {
      alert("Failed to create card item");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">
        Loading products management...
      </div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-50/50 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage categories, product posts, and dynamic card items
              seamlessly.
            </p>
          </div>
          <Link
            href="/admin/products/trash"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            🗑️ View Trash Bin
          </Link>
        </div>

        {/* 🚀 EDIT MODALS SECTION */}
        {editingCategory && canUpdateCategories && (
          <div className="bg-blue-50/90 border-2 border-blue-400 p-6 rounded-2xl space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-blue-900">
              ✏️ Edit Category: {editingCategory.name}
            </h3>
            <form onSubmit={handleUpdateCategory} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-blue-800 uppercase">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-blue-300 text-slate-800 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-blue-800 uppercase">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editCatSlug}
                    onChange={(e) => setEditCatSlug(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-blue-300 text-slate-800 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {editingPost && canUpdateProducts && (
          <div className="bg-emerald-50/90 border-2 border-emerald-400 p-6 rounded-2xl space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-emerald-900">
              ✏️ Edit Product Post: {editingPost.title}
            </h3>
            <form onSubmit={handleUpdatePost} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-emerald-800 uppercase">
                    Category
                  </label>
                  <select
                    value={editPostCatId}
                    onChange={(e) => setEditPostCatId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-emerald-300 text-slate-800 text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-emerald-800 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-emerald-300 text-slate-800 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-emerald-800 uppercase">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editPostSlug}
                    onChange={(e) => setEditPostSlug(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-emerald-300 text-slate-800 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-emerald-800 uppercase">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editPostImage}
                    onChange={(e) => setEditPostImage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-emerald-300 text-slate-800 text-xs focus:outline-none"
                    placeholder="Image URL"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-emerald-800 uppercase">
                  Description
                </label>
                <textarea
                  value={editPostDesc}
                  onChange={(e) => setEditPostDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-emerald-300 text-slate-800 text-xs focus:outline-none resize-none"
                  rows={2}
                  placeholder="Description"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 🚀 3 CREATION FORMS SECTION (Gated with Products Create Permission) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form 1: Category */}
          {canCreateCategories && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <h2 className="text-sm font-bold text-slate-900">
                    1. Create Category
                  </h2>
                </div>
                <form
                  onSubmit={handleCreateCategory}
                  id="cat-form"
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Category Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electronics"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Slug (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. electronics"
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="cat-form"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl text-white transition shadow-sm shadow-blue-500/20 cursor-pointer mt-4"
              >
                Add Category
              </button>
            </div>
          )}

          {/* Form 2: Product Post */}
          {canCreateProducts && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <h2 className="text-sm font-bold text-slate-900">
                    2. Create Product Post
                  </h2>
                </div>
                <form
                  onSubmit={handleCreatePost}
                  id="post-form"
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Category
                    </label>
                    <select
                      value={postCategoryId}
                      onChange={(e) => setPostCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Product Title
                    </label>
                    <input
                      type="text"
                      placeholder="Product Title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={postImage}
                      onChange={(e) => setPostImage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </form>
              </div>
              <button
                type="submit"
                form="post-form"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs rounded-xl text-white transition shadow-sm shadow-emerald-500/20 cursor-pointer mt-4"
              >
                Save Product Post
              </button>
            </div>
          )}

          {/* Form 3: Card Item */}
          {canCreateCards && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <h2 className="text-sm font-bold text-slate-900">
                    3. Add Info/Pic to Product
                  </h2>
                </div>
                <form
                  onSubmit={handleCreateCard}
                  id="card-form"
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Product Post
                    </label>
                    <select
                      value={cardPostId}
                      onChange={(e) => setCardPostId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                    >
                      <option value="">Select Product Post</option>
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Info Title"
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={cardImage}
                      onChange={(e) => setCardImage(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <textarea
                    placeholder="Info Description"
                    rows={2}
                    value={cardDesc}
                    onChange={(e) => setCardDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                  />
                </form>
              </div>
              <button
                type="submit"
                form="card-form"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 font-bold text-xs rounded-xl text-white transition shadow-sm shadow-purple-500/20 cursor-pointer mt-4"
              >
                Add Card Item
              </button>
            </div>
          )}
        </div>

        {/* 📋 TABLES SECTION */}
        <div className="space-y-6">
          {/* 1. Categories Management Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              📂 Categories Management
            </h2>
            {canReadCategories ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 text-xs">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <tr
                          key={cat.id}
                          className="hover:bg-slate-50/60 transition"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {cat.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {cat.slug}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            {canUpdateCategories && (
                              <button
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setEditCatName(cat.name);
                                  setEditCatSlug(cat.slug);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                              >
                                Edit
                              </button>
                            )}
                            {canDeleteCategories && (
                              <>
                                <button
                                  onClick={() =>
                                    handleSoftDeleteCategory(cat.id)
                                  }
                                  className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Trash
                                </button>
                                <button
                                  onClick={() =>
                                    handlePermanentDeleteCategory(cat.id)
                                  }
                                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-8 text-slate-400 text-xs"
                        >
                          No active categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-rose-500 text-xs font-medium">
                You do not have permission (`products:read`) to view categories.
              </div>
            )}
          </div>

          {/* 2. Product Posts Management Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              📦 Product Posts Management
            </h2>
            {canReadProducts ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 text-xs">
                    {posts.length > 0 ? (
                      posts.map((post) => {
                        return (
                          <tr
                            key={post.id}
                            className="hover:bg-slate-50/60 transition"
                          >
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              {post.title}
                            </td>
                            <td className="py-3.5 px-4 text-blue-600 font-medium">
                              {post.category?.name || "N/A"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {post.slug}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              <Link
                                href={`/admin/products/${post.id}/cards`}
                                className="px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs font-semibold inline-block transition"
                              >
                                View Cards
                              </Link>

                              {canUpdateProducts && (
                                <button
                                  onClick={() => {
                                    setEditingPost(post);
                                    setEditPostTitle(post.title);
                                    setEditPostSlug(post.slug || "");
                                    setEditPostCatId(post.categoryId);
                                    setEditPostImage(post.imageUrl || "");
                                    setEditPostDesc(post.description || "");
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Edit
                                </button>
                              )}
                              {canDeleteProducts && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleSoftDeletePost(post.id)
                                    }
                                    className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                  >
                                    Trash
                                  </button>
                                  <button
                                    onClick={() =>
                                      handlePermanentDeletePost(post.id)
                                    }
                                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-slate-400 text-xs"
                        >
                          No active product posts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-rose-500 text-xs font-medium">
                You do not have permission (`products:read`) to view product
                posts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
