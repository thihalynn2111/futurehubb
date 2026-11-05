"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

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
  const [editPostCatId, setEditPostCatId] = useState("");
  const [editPostImage, setEditPostImage] = useState("");
  const [editPostDesc, setEditPostDesc] = useState("");

  const fetchData = async () => {
    try {
      const resCat = await fetch("/api/admin/categories");
      if (resCat.ok) {
        const dataCat = await resCat.json();
        // Show only active (not deleted) items
        setCategories(dataCat.filter((c: any) => !c.deletedAt));
      }

      const resPost = await fetch("/api/admin/products");
      if (resPost.ok) {
        const dataPost = await resPost.json();
        // Show only active (not deleted) items
        setPosts(dataPost.filter((p: any) => !p.deletedAt));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with View Trash Bin Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Management Portal
          </h1>
          <Link
            href="/admin/products/trash"
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer shadow-sm"
          >
            🗑️ View Trash Bin
          </Link>
        </div>

        {/* 🚀 3 CREATION FORMS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form 1: Category */}
          <div className="bg-[#0b132b] text-white rounded-2xl p-6 shadow-md space-y-4 border border-slate-800">
            <h2 className="text-base font-bold text-teal-400">
              1. Create Category
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
              />
              <input
                type="text"
                placeholder="Slug (optional)"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold text-sm rounded-xl text-white cursor-pointer"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Form 2: Product Post */}
          <div className="bg-[#0b132b] text-white rounded-2xl p-6 shadow-md space-y-4 border border-slate-800">
            <h2 className="text-base font-bold text-teal-400">
              2. Create Product Post
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <select
                value={postCategoryId}
                onChange={(e) => setPostCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Product Title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
              />
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold text-sm rounded-xl text-white cursor-pointer"
              >
                Save Product Post
              </button>
            </form>
          </div>

          {/* Form 3: Card Item */}
          <div className="bg-[#0b132b] text-white rounded-2xl p-6 shadow-md space-y-4 border border-slate-800">
            <h2 className="text-base font-bold text-teal-400">
              3. Add Info/Pic to Product
            </h2>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <select
                value={cardPostId}
                onChange={(e) => setCardPostId(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white cursor-pointer"
              >
                <option value="">Select Product Post</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Info Title"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
              />
              <input
                type="text"
                placeholder="Card Image URL"
                value={cardImage}
                onChange={(e) => setCardImage(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
              />
              <textarea
                placeholder="Info Description"
                rows={2}
                value={cardDesc}
                onChange={(e) => setCardDesc(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white resize-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 font-bold text-sm rounded-xl text-white cursor-pointer"
              >
                Add Card Item
              </button>
            </form>
          </div>
        </div>

        {/* 📋 EDIT MODALS */}
        {editingCategory && (
          <div className="bg-[#0b132b] text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-teal-400">
              Edit Category: {editingCategory.name}
            </h3>
            <form onSubmit={handleUpdateCategory} className="space-y-3">
              <input
                type="text"
                value={editCatName}
                onChange={(e) => setEditCatName(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] rounded-xl border border-slate-700 text-white text-sm"
                required
              />
              <input
                type="text"
                value={editCatSlug}
                onChange={(e) => setEditCatSlug(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] rounded-xl border border-slate-700 text-white text-sm"
              />
              <div className="space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {editingPost && (
          <div className="bg-[#0b132b] text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-teal-400">
              Edit Product Post: {editingPost.title}
            </h3>
            <form onSubmit={handleUpdatePost} className="space-y-3">
              <select
                value={editPostCatId}
                onChange={(e) => setEditPostCatId(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] rounded-xl border border-slate-700 text-white text-sm cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={editPostTitle}
                onChange={(e) => setEditPostTitle(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] rounded-xl border border-slate-700 text-white text-sm"
                required
              />
              <input
                type="text"
                value={editPostImage}
                onChange={(e) => setEditPostImage(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] rounded-xl border border-slate-700 text-white text-sm"
                placeholder="Image URL"
              />
              <textarea
                value={editPostDesc}
                onChange={(e) => setEditPostDesc(e.target.value)}
                className="w-full px-4 py-2 bg-[#1c2541] rounded-xl border border-slate-700 text-white text-sm resize-none"
                rows={2}
                placeholder="Description"
              />
              <div className="space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 📋 TABLES SECTION */}
        <div className="space-y-6">
          {/* 1. Categories Management Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              📂 Categories Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{cat.slug}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCatName(cat.name);
                              setEditCatSlug(cat.slug);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSoftDeleteCategory(cat.id)}
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold cursor-pointer"
                          >
                            Trash
                          </button>
                          <button
                            onClick={() =>
                              handlePermanentDeleteCategory(cat.id)
                            }
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-slate-400"
                      >
                        No active categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Product Posts Management Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              📦 Product Posts Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {posts.length > 0 ? (
                    posts.map((post) => {
                      const hasCards = post.cards && post.cards.length > 0;
                      return (
                        <tr key={post.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {post.title}
                          </td>
                          <td className="py-3 px-4 text-blue-600 font-medium">
                            {post.category?.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {post.slug}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {hasCards && (
                              <Link
                                href={`/admin/products/${post.id}/cards`}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold inline-block"
                              >
                                View Cards
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                setEditingPost(post);
                                setEditPostTitle(post.title);
                                setEditPostCatId(post.categoryId);
                                setEditPostImage(post.imageUrl || "");
                                setEditPostDesc(post.description || "");
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleSoftDeletePost(post.id)}
                              className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold cursor-pointer"
                            >
                              Trash
                            </button>
                            <button
                              onClick={() => handlePermanentDeletePost(post.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-slate-400"
                      >
                        No active product posts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
