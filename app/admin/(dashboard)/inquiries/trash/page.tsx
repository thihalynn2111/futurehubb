"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function InquiriesTrashPage() {
  const [trashedInquiries, setTrashedInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trashed inquiries using the ?status=trashed query
  const fetchTrashedInquiries = async () => {
    try {
      const res = await fetch("/api/admin/inquiries?status=trashed");
      if (res.ok) {
        const data = await res.json();
        setTrashedInquiries(data);
      }
    } catch (err) {
      console.error("Error fetching trashed inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedInquiries();
  }, []);

  // Restore Inquiry
  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "PUT" });
      if (res.ok) {
        alert("Inquiry restored successfully!");
        fetchTrashedInquiries();
      } else {
        alert("Failed to restore inquiry");
      }
    } catch (err) {
      console.error("Error restoring inquiry:", err);
    }
  };

  // Permanent Delete Inquiry
  const handlePermanentDelete = async (id: number) => {
    if (!confirm("⚠️ PERMANENT DELETE: This cannot be undone! Proceed?"))
      return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}?permanent=true`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Inquiry permanently deleted!");
        fetchTrashedInquiries();
      } else {
        alert("Failed to permanently delete inquiry");
      }
    } catch (err) {
      console.error("Error permanent deleting inquiry:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">
        Loading inquiries trash...
      </div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Link
            href="/admin/inquiries"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            ← Back to Inquiries Management
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900">
            🗑️ Trash Bin (Deleted Inquiries)
          </h1>
          <p className="text-xs text-slate-500">
            ဤနေရာတွင် ဖျက်ထားသော Customer Inquiries / မက်ဆေ့ခ်ျများကို Restore
            ပြန်လုပ်ခြင်း (သို့) အပြီးအပိုင်ဖျက်ခြင်းများ လုပ်ဆောင်နိုင်ပါသည်။
          </p>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject & Message</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {trashedInquiries.length > 0 ? (
                  trashedInquiries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.email}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top max-w-sm">
                        <div className="font-bold text-xs text-slate-800 mb-1">
                          {item.subject || "No Subject"}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {item.message}
                        </p>
                      </td>
                      <td className="py-4 px-4 align-top text-xs text-slate-400">
                        {item.deletedAt
                          ? new Date(item.deletedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4 align-top text-right space-x-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-200"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-200"
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
