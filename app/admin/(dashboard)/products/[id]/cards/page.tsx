"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

export default function ProductCardsManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal/Form States
  const [editingCard, setEditingCard] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");

  const fetchProductCards = async () => {
    try {
      setLoading(true);

      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) {
          setUserRoles(meData.user.roles || []);
          setUserPermissions(meData.user.permissions || []);
        }
      }

      const resProd = await fetch(`/api/admin/products`);
      if (resProd.ok) {
        const products = await resProd.json();
        const currentProduct = products.find(
          (p: any) => p.id.toString() === productId,
        );
        setProduct(currentProduct);
      }

      const resCards = await fetch(
        `/api/admin/card-items?productId=${productId}`,
      );
      if (resCards.ok) {
        const cardData = await resCards.json();
        setCards(cardData.filter((c: any) => !c.deletedAt));
      }
    } catch (err) {
      console.error("Error fetching product cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductCards();
    }
  }, [productId]);

  const isSuperAdmin = userRoles.some(
    (role) =>
      role.toLowerCase() === "super-admin" ||
      role.toLowerCase() === "super_admin" ||
      role.toLowerCase() === "admin",
  );

  const hasPermission = (permissionKey: string) => {
    return isSuperAdmin || userPermissions.includes(permissionKey);
  };

  const canReadCards =
    hasPermission("cards:read") || hasPermission("products:read");
  const canUpdateCards =
    hasPermission("cards:update") || hasPermission("products:update");
  const canDeleteCards =
    hasPermission("cards:delete") || hasPermission("products:delete");

  const handleEditClick = (card: any) => {
    setEditingCard(card);
    setEditTitle(card.title || "");
    setEditDesc(card.description || "");
    setEditImage(card.imageUrl || "");
    setEditNumber(card.number || "");
    setEditIcon(card.icon || "");
    setEditSortOrder(String(card.sortOrder || "0"));
    // Edit လုပ်တဲ့အခါ အပေါ်ကို Scroll ဆွဲပေးမယ်
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    try {
      const res = await fetch(`/api/admin/card-items/${editingCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          imageUrl: editImage,
          number: editNumber,
          icon: editIcon,
          sortOrder: Number(editSortOrder),
        }),
      });

      if (res.ok) {
        alert("Card updated successfully!");
        setEditingCard(null);
        fetchProductCards();
      } else {
        alert("Failed to update card");
      }
    } catch (err) {
      console.error("Error updating card:", err);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Are you sure you want to move this card to trash?")) return;

    try {
      const res = await fetch(`/api/admin/card-items/${cardId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Card moved to trash!");
        fetchProductCards();
      } else {
        alert("Failed to delete card");
      }
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600 bg-slate-50/50 min-h-screen">
        Loading cards...
      </div>
    );

  const inputClass =
    "w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition";

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-50/50 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 🧭 BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link
            href="/admin/products"
            className="hover:text-blue-600 font-semibold cursor-pointer"
          >
            📦 Products
          </Link>
          {product && (
            <>
              <span>›</span>
              <span className="font-semibold text-slate-800">
                {product.title}
              </span>
            </>
          )}
          <span>›</span>
          <span className="font-semibold text-purple-600">Cards</span>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Cards Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage detailed card items belonging to{" "}
              <span className="font-semibold text-purple-600">
                {product?.title || "this product"}
              </span>
              .
            </p>
          </div>
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
          >
            ← Back to Products
          </Link>
        </div>

        {/* 🚀 EDIT MODAL SECTION */}
        {editingCard && canUpdateCards && (
          <div className="bg-purple-50/90 border-2 border-purple-400 p-6 rounded-2xl space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-purple-900">
              ✏️ Edit Card Item: {editingCard.title}
            </h3>
            <form onSubmit={handleUpdateCard} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-800 uppercase">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-800 uppercase">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-800 uppercase">
                    Number
                  </label>
                  <input
                    type="text"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-800 uppercase">
                    Icon (URL / Class)
                  </label>
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. fa-user"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-800 uppercase">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value)}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-purple-800 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className={`${inputClass} resize-none`}
                  placeholder="Description"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 🚀 CONTENT (TABLE VIEW) */}
        {!canReadCards ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-center text-rose-500 text-xs font-medium">
            You do not have permission (`cards:read`) to view product cards.
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900">
                🃏 Card Items List ({cards.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Card Details</th>
                    <th className="py-4 px-6">Meta Data</th>
                    <th className="py-4 px-6">Sort Order</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {cards.length > 0 ? (
                    cards.map((card) => (
                      <tr
                        key={card.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="py-4 px-6">
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                              No Img
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="font-bold text-slate-900">
                            {card.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-1">
                            {card.description || "No description."}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 text-xs text-slate-600">
                            <span>
                              <strong className="text-slate-400 font-normal">
                                No:
                              </strong>{" "}
                              {card.number || "-"}
                            </span>
                            <span>
                              <strong className="text-slate-400 font-normal">
                                Icon:
                              </strong>{" "}
                              {card.icon || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          {card.sortOrder}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {canUpdateCards && (
                            <button
                              onClick={() => handleEditClick(card)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                            >
                              Edit
                            </button>
                          )}
                          {canDeleteCards && (
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-semibold cursor-pointer transition"
                            >
                              Trash
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-slate-400 text-xs"
                      >
                        No cards for this product yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
