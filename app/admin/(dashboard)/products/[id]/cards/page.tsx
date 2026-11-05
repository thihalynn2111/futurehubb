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
  const [loading, setLoading] = useState(true);

  // Edit Modal/Form States
  const [editingCard, setEditingCard] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState("");

  const fetchProductCards = async () => {
    try {
      setLoading(true);

      // 1. Fetch Product details (title အတွက်)
      const resProd = await fetch(`/api/admin/products`);
      if (resProd.ok) {
        const products = await resProd.json();
        const currentProduct = products.find(
          (p: any) => p.id.toString() === productId,
        );
        setProduct(currentProduct);
      }

      // 2. Fetch cards directly by productId from card-items API 🔥
      const resCards = await fetch(
        `/api/admin/card-items?productId=${productId}`,
      );
      if (resCards.ok) {
        const cardData = await resCards.json();
        // Soft delete မဖြစ်သေးသော card များကို စစ်ထုတ်မည်
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

  // Handle Edit Click
  const handleEditClick = (card: any) => {
    setEditingCard(card);
    setEditTitle(card.title);
    setEditDesc(card.description || "");
    setEditImage(card.imageUrl || "");
  };

  // Handle Update Card
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

  // Handle Delete / Trash Card
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
      <div className="p-8 text-center text-slate-600">Loading cards...</div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/admin/products"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            ← Back to Products Management
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900">
            Cards Management for Product:{" "}
            <span className="text-teal-600">{product?.title || "Product"}</span>
          </h1>
          <p className="text-xs text-slate-500">
            ဤစာမျက်နှာတွင် ဤထုတ်ကုန်နှင့် သက်ဆိုင်သော Card Items များကို Edit
            လုပ်ခြင်း၊ Delete (Trash) ပြုလုပ်ခြင်းတို့ လုပ်ဆောင်နိုင်ပါသည်။
          </p>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Card Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cards.length > 0 ? (
                  cards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {card.title}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-sm">
                        {card.description || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(card)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold cursor-pointer"
                        >
                          Trash
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No cards created for this product yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal / Form Section (Displays when a card is selected for editing) */}
        {editingCard && (
          <div className="bg-[#0b132b] text-white rounded-2xl p-6 shadow-lg space-y-4 border border-slate-800">
            <h2 className="text-lg font-bold text-teal-400">
              Edit Card Item: {editingCard.title}
            </h2>
            <form onSubmit={handleUpdateCard} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Card Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1c2541] border border-slate-700 rounded-xl text-sm outline-none text-white resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-sm rounded-xl text-white cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 font-bold text-sm rounded-xl text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
