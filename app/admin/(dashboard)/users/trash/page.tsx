"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function RoleTrashPage() {
  const [trashedRoles, setTrashedRoles] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchTrashedRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles?trash=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrashedRoles(data.filter((r: any) => r.deletedAt));
      }
    } catch (err) {
      console.error("Failed to fetch trashed roles:", err);
    }
  };

  useEffect(() => {
    fetchTrashedRoles();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/roles/${id}/restore`, {
        method: "PUT",
      });
      if (res.ok) {
        showToast("Role restored successfully! ✅");
        fetchTrashedRoles();
      } else {
        alert("Failed to restore role");
      }
    } catch (err) {
      console.error("Restore error:", err);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (
      !confirm(
        "⚠️ PERMANENT DELETE: This action cannot be undone. Are you sure?",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/roles?id=${id}&permanent=true`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Role permanently deleted! 🗑️");
        fetchTrashedRoles();
      } else {
        alert("Failed to permanently delete role");
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 p-8">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-950">
            🗑️ Roles Trash Bin (Archive Bin)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage deleted roles, restore them, or delete them permanently.
          </p>
        </div>
        <Link
          href="/admin/roles"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm cursor-pointer"
        >
          ← Back to Roles Management
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
              <th className="p-3">Role Name</th>
              <th className="p-3">Label</th>
              <th className="p-3">Deleted At</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y text-gray-800">
            {trashedRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="p-3 font-bold text-slate-900">{role.name}</td>
                <td className="p-3 text-slate-600">{role.label}</td>
                <td className="p-3 text-amber-600 font-medium">
                  {role.deletedAt
                    ? new Date(role.deletedAt).toLocaleString()
                    : "N/A"}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleRestore(role.id)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold transition cursor-pointer"
                  >
                    ♻️ Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(role.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition cursor-pointer"
                  >
                    ⚠️ Delete Permanently
                  </button>
                </td>
              </tr>
            ))}
            {trashedRoles.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  Roles trash bin is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
