"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down navigation (Category -> Product -> Cards)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Which creating form is open
  const [showCatForm, setShowCatForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Form Creation States
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
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
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) {
          setUserRoles(meData.user.roles || []);
          setUserPermissions(meData.user.permissions || []);
        }
      }

      const resCat = await fetch("/api/admin/categories", {
        cache: "no-store",
      });
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategories(dataCat.filter((c: any) => !c.deletedAt));
      }

      const resPost = await fetch("/api/admin/products", { cache: "no-store" });
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

  // Product တစ်ခုရဲ့ Card တွေကို ယူခြင်း
  const fetchCards = async (productId: number) => {
    setCardsLoading(true);
    try {
      const res = await fetch(`/api/admin/card-items?productId=${productId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCards(
          Array.isArray(data) ? data.filter((c: any) => !c.deletedAt) : [],
        );
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setCards([]);
    } finally {
      setCardsLoading(false);
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

  const canReadCategories = canReadProducts;
  const canCreateCategories = canCreateProducts;
  const canUpdateCategories = canUpdateProducts;
  const canDeleteCategories = canDeleteProducts;

  const canCreateCards = canCreateProducts;

  // --- NAVIGATION ---
  const goToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedPostId(null);
    setCards([]);
    setShowPostForm(false);
    setShowCardForm(false);
  };

  const goToProducts = () => {
    setSelectedPostId(null);
    setCards([]);
    setShowCardForm(false);
  };

  const openCategory = (cat: any) => {
    setSelectedCategoryId(cat.id);
    setSelectedPostId(null);
    setCards([]);
    setPostCategoryId(String(cat.id));
    setShowPostForm(false);
    setShowCardForm(false);
  };

  const openPost = (post: any) => {
    setSelectedPostId(post.id);
    setCardPostId(String(post.id));
    setShowCardForm(false);
    fetchCards(post.id);
  };

  // Derived data
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedPost = posts.find((p) => p.id === selectedPostId);
  const categoryPosts = posts.filter(
    (p) => p.categoryId === selectedCategoryId,
  );
  const level =
    selectedCategory && selectedPost
      ? "cards"
      : selectedCategory
        ? "products"
        : "categories";

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
      setShowCatForm(false);
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
        slug: postSlug || postTitle.toLowerCase().replace(/\s+/g, "-"),
        categoryId: Number(postCategoryId),
        imageUrl: postImage,
        description: postDesc,
      }),
    });

    if (res.ok) {
      alert("Product Post created successfully!");
      setPostTitle("");
      setPostSlug("");
      setPostImage("");
      setPostDesc("");
      setShowPostForm(false);
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
      const updatedProduct = await res.json();
      alert("Product Post updated successfully!");

      // 🔄 React State ထဲရှိ posts array ကို Updated Product အသစ်ဖြင့် ချက်ချင်း အစားထိုးမည်
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );

      setEditingPost(null);
      fetchData(); // Sync with server background
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
      setCardTitle("");
      setCardDesc("");
      setCardImage("");
      fetchData();
      fetchCards(Number(cardPostId));
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

  const inputClass =
    "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition";

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
              Choose a category, open a product, then manage its card items.
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

        {!canReadProducts ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-center text-rose-500 text-xs font-medium">
            You do not have permission (`products:read`) to view products.
          </div>
        ) : (
          <>
            {/* 🧭 BREADCRUMB */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <button
                onClick={goToCategories}
                className="hover:text-blue-600 font-semibold cursor-pointer"
              >
                📂 Categories
              </button>
              {selectedCategory && (
                <>
                  <span>›</span>
                  <button
                    onClick={goToProducts}
                    className="hover:text-blue-600 font-semibold cursor-pointer"
                  >
                    {selectedCategory.name}
                  </button>
                </>
              )}
              {selectedCategory && selectedPost && (
                <>
                  <span>›</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPost.title}
                  </span>
                </>
              )}
            </div>

            {/* ================= LEVEL 1: CATEGORIES ================= */}
            {level === "categories" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    📂 Categories ({categories.length})
                  </h2>
                  {canCreateCategories && (
                    <button
                      onClick={() => setShowCatForm(!showCatForm)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                    >
                      {showCatForm ? "✕ Close" : "+ New Category"}
                    </button>
                  )}
                </div>

                {showCatForm && canCreateCategories && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Create Category
                      </h3>
                    </div>
                    <form onSubmit={handleCreateCategory} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">
                            Category Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Electronics"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            className={inputClass}
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
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl text-white transition shadow-sm cursor-pointer"
                      >
                        Add Category
                      </button>
                    </form>
                  </div>
                )}

                {canReadCategories && categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categories.map((cat) => {
                      const count = posts.filter(
                        (p) => p.categoryId === cat.id,
                      ).length;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => openCategory(cat)}
                          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">📁</span>
                              <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                                {count} products
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {cat.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {cat.slug}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {canUpdateCategories && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSoftDeleteCategory(cat.id);
                                  }}
                                  className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Trash
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePermanentDeleteCategory(cat.id);
                                  }}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400 text-xs">
                    No active categories found.
                  </div>
                )}
              </div>
            )}

            {/* ================= LEVEL 2: PRODUCTS IN CATEGORY ================= */}
            {level === "products" && selectedCategory && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    📦 Products in {selectedCategory.name} (
                    {categoryPosts.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={goToCategories}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                    >
                      ← Back
                    </button>
                    {canCreateProducts && (
                      <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                      >
                        {showPostForm ? "✕ Close" : "+ New Product"}
                      </button>
                    )}
                  </div>
                </div>

                {showPostForm && canCreateProducts && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Create Product Post
                      </h3>
                    </div>
                    <form onSubmit={handleCreatePost} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">
                            Category
                          </label>
                          <select
                            value={postCategoryId}
                            onChange={(e) => setPostCategoryId(e.target.value)}
                            className={`${inputClass} cursor-pointer`}
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
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">
                            Slug (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. future-hrms-solution"
                            value={postSlug}
                            onChange={(e) => setPostSlug(e.target.value)}
                            className={inputClass}
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
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">
                          Description
                        </label>
                        <textarea
                          placeholder="Short description about this product"
                          rows={3}
                          value={postDesc}
                          onChange={(e) => setPostDesc(e.target.value)}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs rounded-xl text-white transition shadow-sm cursor-pointer"
                      >
                        Save Product Post
                      </button>
                    </form>
                  </div>
                )}

                {categoryPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => openPost(post)}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col"
                      >
                        <div className="h-32 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl font-extrabold text-slate-300">
                              {post.title?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-bold text-slate-900">
                              {post.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {post.slug}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {post.description || "No description."}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {canUpdateProducts && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSoftDeletePost(post.id);
                                  }}
                                  className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Trash
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePermanentDeletePost(post.id);
                                  }}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400 text-xs">
                    No active products in this category yet.
                  </div>
                )}
              </div>
            )}

            {/* ================= LEVEL 3: CARDS OF PRODUCT ================= */}
            {level === "cards" && selectedPost && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {selectedPost.imageUrl ? (
                        <img
                          src={selectedPost.imageUrl}
                          alt={selectedPost.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-extrabold text-slate-300">
                          {selectedPost.title?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold text-slate-900">
                        {selectedPost.title}
                      </h2>
                      <p className="text-xs text-slate-500 max-w-xl">
                        {selectedPost.description || "No description."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={goToProducts}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                    >
                      ← Back
                    </button>
                    <Link
                      href={`/admin/products/${selectedPost.id}/cards`}
                      className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl text-xs font-bold transition"
                    >
                      Manage Cards
                    </Link>
                    {canCreateCards && (
                      <button
                        onClick={() => setShowCardForm(!showCardForm)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                      >
                        {showCardForm ? "✕ Close" : "+ Add Card"}
                      </button>
                    )}
                  </div>
                </div>

                {showCardForm && canCreateCards && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Add Info/Pic to {selectedPost.title}
                      </h3>
                    </div>
                    <form onSubmit={handleCreateCard} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">
                            Info Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Attendance"
                            value={cardTitle}
                            onChange={(e) => setCardTitle(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 uppercase">
                            Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={cardImage}
                            onChange={(e) => setCardImage(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase">
                          Info Description
                        </label>
                        <textarea
                          placeholder="Write one point per line (each line can become a bullet point)"
                          rows={4}
                          value={cardDesc}
                          onChange={(e) => setCardDesc(e.target.value)}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 font-bold text-xs rounded-xl text-white transition shadow-sm cursor-pointer"
                      >
                        Add Card Item
                      </button>
                    </form>
                  </div>
                )}

                <h2 className="text-sm font-bold text-slate-900">
                  🃏 Cards ({cards.length})
                </h2>

                {cardsLoading ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400 text-xs">
                    Loading cards...
                  </div>
                ) : cards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                      >
                        {card.imageUrl && (
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-5 space-y-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 whitespace-pre-line">
                            {card.description || "No description."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400 text-xs">
                    No cards for this product yet.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
