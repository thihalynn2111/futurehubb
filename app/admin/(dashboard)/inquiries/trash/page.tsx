"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function InquiryTrashPage() {
  const [trashedInquiries, setTrashedInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Trashed Inquiries (where deletedAt is not null)
  const fetchTrashData = async () => {
    try {
      const res = await fetch("/api/admin/inquiries/trash"); // or your specific trash API route
      if (res.ok) {
        const data = await res.json();
        setTrashedInquiries(data);
      }
    } catch (err) {
      console.error("Error fetching trash:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashData();
  }, []);

  // Handle Restore Inquiry
  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      if (res.ok) {
        alert("Inquiry restored successfully! ✅");
        fetchTrashData(); // Refresh list
      } else {
        alert("Failed to restore inquiry");
      }
    } catch (err) {
      console.error("Error restoring:", err);
      alert("Something went wrong while restoring.");
    }
  };

  // Handle Permanent Delete (Optional if you have it)
  const handlePermanentDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this inquiry?"))
      return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/permanent`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Permanently deleted! 🗑️");
        fetchTrashData();
      } else {
        alert("Failed to delete permanently.");
      }
    } catch (err) {
      console.error("Error permanent delete:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">Loading trash...</div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Management Portal
            </h1>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            ← Back to Inquiries Management
          </Link>
        </div>

        {/* Trash Bin Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">
              🗑️ Trash Bin (Deleted Inquiries)
            </h2>
            <p className="text-xs text-slate-500">
              ဤနေရာတွင် ဖျက်ထားသော Customer Inquiries / မေးမြန်းချက်များကို
              Restore ပြန်လုပ်ခြင်း (သို့) အပြီးအပိုင်ဖျက်ခြင်းများ
              လုပ်ဆောင်နိုင်ပါသည်။
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">SENDER</th>
                  <th className="py-3 px-4">SUBJECT & MESSAGE</th>
                  <th className="py-3 px-4">DELETED AT</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {trashedInquiries.length > 0 ? (
                  trashedInquiries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.email}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {item.subject || "No Subject"}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {item.message}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500">
                        {item.deletedAt
                          ? new Date(item.deletedAt).toLocaleString()
                          : "N/A"}
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Delete Permanently
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      Trash bin is empty.
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
