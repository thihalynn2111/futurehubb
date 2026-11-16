"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🚀 Permission States
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const checkPermissions = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userInfo = data.user || {};
        const userRoles = userInfo.roles || [];
        const permissions = userInfo.permissions || [];

        setCurrentUserId(userInfo.id);

        const isSuper = userRoles.some((r: string) =>
          ["super_admin", "super-admin", "admin", "system"].includes(
            r.toLowerCase(),
          ),
        );

        const lowerPerms = permissions.map((p: string) => p.toLowerCase());

        const hasRead =
          isSuper ||
          lowerPerms.includes("users:read") ||
          lowerPerms.includes("*");
        const hasCreate =
          isSuper ||
          lowerPerms.includes("users:create") ||
          lowerPerms.includes("*");
        const hasUpdate =
          isSuper ||
          lowerPerms.includes("users:update") ||
          lowerPerms.includes("*");
        const hasDelete =
          isSuper ||
          lowerPerms.includes("users:delete") ||
          lowerPerms.includes("*");

        setCanRead(hasRead);
        setCanCreate(hasCreate);
        setCanUpdate(hasUpdate);
        setCanDelete(hasDelete);

        if (hasRead) {
          fetchRoles();
          fetchUsers();
        } else {
          alert("Access Denied: You do not have permission to view users.");
          router.replace("/admin");
        }
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const filteredRoles = data.filter((r) => {
          if (r.deletedAt) return false;
          const rName = r.name || r;
          return rName !== "SUPER_ADMIN" && rName !== "SUPER ADMIN";
        });
        setRoles(filteredRoles);
        if (filteredRoles.length > 0) {
          setRole(filteredRoles[0].name || filteredRoles[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user");

      setMessage("User created successfully! 🎉");
      setName("");
      setEmail("");
      setPassword("");
      fetchUsers();
      router.refresh();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    userId: number | string,
    newStatus: number,
  ) => {
    if (!canUpdate) return;

    const confirmMsg =
      newStatus === 0
        ? "Are you sure you want to BAN this user? They will not be able to log in."
        : "Are you sure you want to ACTIVE this user?";

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🚀 "Delete" အစား "Trash" လုပ်မယ့် Function
  const handleTrashUser = async (
    userId: number | string,
    userRole: string,
    userEmail: string,
  ) => {
    if (!canDelete) return;

    if (
      userRole?.includes("SUPER_ADMIN") ||
      userEmail === "admin@futurehub.com"
    ) {
      alert("❌ Super Admin account cannot be trashed!");
      return;
    }

    if (!confirm("Are you sure you want to move this user to trash?")) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to trash user");

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            👥 User Management Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, and assign roles to system users and authors.
          </p>
        </div>

        {canDelete && (
          <Link
            href="/admin/users/trash"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            🗑️ View Trash Bin
          </Link>
        )}
      </div>

      <div
        className={`grid grid-cols-1 ${canCreate ? "xl:grid-cols-3" : "xl:grid-cols-1"} gap-6 items-start`}
      >
        {/* 1. CREATE USER FORM */}
        {canCreate && (
          <div className="xl:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              👤 Create New User
            </h2>

            {message && (
              <div
                className={`p-3 rounded-xl mb-5 text-sm font-semibold ${
                  message.includes("success")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="author@futurehub.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Assign Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {roles.map((r, idx) => {
                    const roleName = r.name || r;
                    return (
                      <option key={idx} value={roleName}>
                        {roleName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm mt-2"
              >
                {loading ? "Creating..." : "Save User"}
              </button>
            </form>
          </div>
        )}

        {/* 2. USERS LIST TABLE */}
        <div
          className={`${canCreate ? "xl:col-span-2" : "xl:col-span-1"} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">
              Existing Users ({users.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No users or authors found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSuper =
                      u.role?.includes("SUPER_ADMIN") ||
                      u.email === "admin@futurehub.com";

                    const isSelf = u.id === currentUserId;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">
                            {u.name}{" "}
                            {isSelf && (
                              <span className="text-xs text-blue-500 font-normal">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-bold">
                            {u.role || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          {isSuper ? (
                            <span className="text-slate-400 text-xs">-</span>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                Number(u.status) === 1
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {Number(u.status) === 1 ? "ACTIVE" : "BANNED"}
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex items-center justify-end space-x-2">
                          {!isSuper && !isSelf && (
                            <>
                              {canUpdate && (
                                <select
                                  value={u.status ?? 1}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      u.id,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value={1}>Active</option>
                                  <option value={0}>Banned</option>
                                </select>
                              )}

                              {/* 🚀 Delete ခလုတ်နေရာမှာ Trash ခလုတ်လေး ပြောင်းထည့်ထားပါတယ် */}
                              {canDelete && (
                                <button
                                  onClick={() =>
                                    handleTrashUser(u.id, u.role, u.email)
                                  }
                                  className="bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                >
                                  🗑️ Trash
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
