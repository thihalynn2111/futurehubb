"use client";

import React, { useState, useEffect } from "react";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setRoleName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Database မှ Roles များကို Fetch လုပ်ရန်
  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRoles(data);
      } else {
        console.error("API response is not an array:", data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleName,
          label: label,
          description: description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Role Created Successfully in DB! ✅");
        setRoleName("");
        setLabel("");
        setDescription("");
        fetchRoles(); // Refresh list from DB
      } else {
        alert(data.message || data.error || "Failed to create role");
      }
    } catch (err) {
      console.error("Network or client error:", err);
      alert("Something went wrong. Please check console.");
    }
  };

  // 👇 Role ကို Soft Delete လုပ်ရန် function အသစ်ထည့်သွင်းခြင်း
  const handleDeleteRole = async (id: number) => {
    if (!confirm("ဒီ Role ကို Soft Delete လုပ်မှာ သေချာပါသလား?")) return;

    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Role Soft Deleted Successfully! 🗑️");
        fetchRoles(); // List ကို ပြန်ဆွဲထုတ်မည် (deletedAt တွေ ဝင်သွားပြီမို့ ပျောက်သွားပါမည်)
      } else {
        alert(data.message || "Failed to delete role");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">
        🛡️ Role Management (ရာထူး စီမံခန့်ခွဲမှု)
      </h1>

      {/* Existing Roles Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 font-bold text-lg">
          Existing Roles List (From Database)
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                <th className="p-3">Role Name</th>
                <th className="p-3">Label</th>
                <th className="p-3">Users</th>
                <th className="p-3">System Role?</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y text-gray-800">
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-3 font-bold">{r.name}</td>
                  <td className="p-3">{r.label}</td>
                  <td className="p-3">{r._count?.userRoles ?? 0}</td>
                  <td className="p-3">
                    {r.isSystem ? (
                      <span className="text-amber-600 font-semibold">
                        🔒 Yes
                      </span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td className="p-3">
                    {!r.isSystem ? (
                      <button
                        onClick={() => handleDeleteRole(r.id)} // 👈 Delete ခလုတ်တွင် onClick ချိတ်ပေးလိုက်ပါပြီ
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No roles found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Role Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-xl">
        <div className="bg-slate-900 text-white px-6 py-4 font-bold text-lg">
          ➕ Create New Role
        </div>
        <form onSubmit={handleCreateRole} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Role Name (Key):
            </label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="marketing_manager"
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Label:
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="မားကတ်တင်း မန်နေဂျာ"
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ဖော်ပြချက်..."
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-right pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition"
            >
              💾 Save Role to DB
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
