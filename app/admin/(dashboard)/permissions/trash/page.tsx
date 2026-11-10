"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PermissionsTrashPage() {
  const [trashedPermissions, setTrashedPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchTrashedPermissions = async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        // deletedAt ပါရှိသော (Trash ထဲရောက်နေသော) များကိုသာ စစ်ထုတ်ယူခြင်း
        setTrashedPermissions(data.filter((p: any) => p.deletedAt));
      }
    } catch (err) {
      console.error("Failed to fetch trashed permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedPermissions();
  }, []);

  // ♻️ Restore Permission
  const handleRestore = async (id: number) => {
    const res = await fetch(`/api/admin/permissions/${id}`, {
      method: "PUT",
    });

    if (res.ok) {
      showToast("Permission restored successfully! ✅");
      fetchTrashedPermissions();
    } else {
      alert("Failed to restore permission");
    }
  };

  // ❌ Permanent Delete
  const handlePermanentDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `⚠️ PERMANENT DELETE: '${name}' ကို လုံးဝဖျက်ပစ်မှာ သေချာပါသလား?`,
      )
    ) {
      return;
    }

    const res = await fetch(`/api/admin/permissions/${id}?permanent=true`, {
      method: "DELETE",
    });

    if (res.ok) {
      showToast("Permission permanently deleted! 🗑️");
      fetchTrashedPermissions();
    } else {
      alert("Failed to permanently delete permission");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600">Loading trash bin...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 p-6">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-950">
            Permissions Trash Bin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage deleted permissions. Restore or delete permanently.
          </p>
        </div>
        <Link
          href="/admin/permissions"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm cursor-pointer"
        >
          ← Back to Permissions
        </Link>
      </div>

      {/* Trashed Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Permission Name</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Deleted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {trashedPermissions.length > 0 ? (
                trashedPermissions.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <code className="bg-rose-50 text-rose-700 px-2 py-1 rounded font-mono">
                        {p.name}
                      </code>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-slate-700">
                      {p.resource}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.deletedAt
                        ? new Date(p.deletedAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRestore(p.id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold cursor-pointer transition"
                      >
                        ♻️ Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(p.id, p.name)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-semibold cursor-pointer transition"
                      >
                        ❌ Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-slate-400 text-xs"
                  >
                    Trash bin is empty. No deleted permissions found.
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
