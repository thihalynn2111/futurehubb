"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setRoleName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState("");

  // 🚀 Permission States
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const checkPermissions = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userInfo = data.user || {};
        const roles = userInfo.roles || [];
        const permissions = userInfo.permissions || [];

        const isSuper = roles.some((r: string) =>
          ["super_admin", "super-admin", "admin", "system"].includes(
            r.toLowerCase(),
          ),
        );

        const lowerPerms = permissions.map((p: string) => p.toLowerCase());

        const hasRead =
          isSuper ||
          lowerPerms.includes("roles:read") ||
          lowerPerms.includes("*");
        const hasCreate =
          isSuper ||
          lowerPerms.includes("roles:create") ||
          lowerPerms.includes("*");
        const hasDelete =
          isSuper ||
          lowerPerms.includes("roles:delete") ||
          lowerPerms.includes("*");

        setCanRead(hasRead);
        setCanCreate(hasCreate);
        setCanDelete(hasDelete);

        if (hasRead) {
          fetchRoles();
        } else {
          alert("Access Denied: You do not have permission to view roles.");
          router.replace("/admin");
        }
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName, label, description }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Role Created Successfully in DB! ✅");
        setRoleName("");
        setLabel("");
        setDescription("");
        fetchRoles();
      } else {
        alert(data.message || "Failed to create role");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 "Delete" အစား "Trash" လုပ်မယ့် Function
  const handleTrashRole = async (id: number) => {
    if (!canDelete) return;
    if (!confirm("ဒီ Role ကို Trash သို့ ရွှေ့ရန် သေချာပါသလား?")) return;

    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Role moved to trash successfully! 🗑️");
        fetchRoles();
      } else {
        alert(data.message || "Failed to trash role");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition";

  if (!canRead) {
    return (
      <div className="p-10 text-center text-slate-500">
        Checking permissions...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 p-4 md:p-8">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🛡️ Role Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system roles and their permissions.
          </p>
        </div>

        {canDelete && (
          <Link
            href="/admin/roles/trash"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            🗑️ View Trash Bin
          </Link>
        )}
      </div>

      <div
        className={`grid grid-cols-1 ${canCreate ? "xl:grid-cols-3" : "xl:grid-cols-1"} gap-6 items-start`}
      >
        {/* 1. CREATE NEW ROLE FORM */}
        {canCreate && (
          <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                ➕ Create New Role
              </h2>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Role Name (Key)
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="marketing_manager"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="မားကတ်တင်း မန်နေဂျာ"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ဖော်ပြချက်..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  💾 Save Role to DB
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. EXISTING ROLES TABLE */}
        <div
          className={`${canCreate ? "xl:col-span-2" : "xl:col-span-1"} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}
        >
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              Existing Roles List
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-semibold">Role Name</th>
                  <th className="p-4 font-semibold">Label</th>
                  <th className="p-4 font-semibold text-center">Users</th>
                  <th className="p-4 font-semibold">System Role?</th>
                  {canDelete && (
                    <th className="p-4 font-semibold text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {roles.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900">{r.name}</td>
                    <td className="p-4 text-slate-600">{r.label}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {r._count?.userRoles ?? 0}
                      </span>
                    </td>
                    <td className="p-4">
                      {r.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          🔒 Yes
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>
                    {canDelete && (
                      <td className="p-4 text-right">
                        {!r.isSystem ? (
                          // 🚀 Delete ခလုတ်နေရာမှာ Trash ခလုတ်လေး ပြောင်းထည့်ထားပါတယ်
                          <button
                            onClick={() => handleTrashRole(r.id)}
                            className="bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            🗑️ Trash
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Protected
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td
                      colSpan={canDelete ? 5 : 4}
                      className="p-8 text-center text-slate-400"
                    >
                      No roles found in database.
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
