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

  useEffect(() => {
    fetchRoles();
    fetchUsers();
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
    // 🚀 Banned လုပ်ရင် သေချာမေးမယ်
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

  const handleDeleteUser = async (
    userId: number | string,
    userRole: string,
    userEmail: string,
  ) => {
    if (
      userRole?.includes("SUPER_ADMIN") ||
      userEmail === "admin@futurehub.com"
    ) {
      alert("❌ Super Admin account cannot be deleted!");
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 p-8">
      {/* Header with View Trash Bin Link */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            👥 User Management Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, manage, and assign roles to system users and authors.
          </p>
        </div>
        <Link
          href="/admin/users/trash"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          🗑️ View Trash Bin
        </Link>
      </div>

      {/* 1. CREATE USER FORM */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          👤 Create New Author / User
        </h2>

        {message && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm font-semibold ${
              message.includes("success")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              placeholder="author@futurehub.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Assign Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white cursor-pointer"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : "Save User"}
          </button>
        </form>
      </div>

      {/* 2. DYNAMIC USERS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          👥 Existing Authors & Users
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y text-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No users or authors found. Create one above!
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuper =
                    u.role?.includes("SUPER_ADMIN") ||
                    u.email === "admin@futurehub.com";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                          {u.role || "N/A"}
                        </span>
                      </td>
                      <td className="p-3">
                        {isSuper ? (
                          <span className="text-gray-400 font-semibold text-xs">
                            -
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              Number(u.status) === 1
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {Number(u.status) === 1 ? "ACTIVE" : "BANNED"}
                          </span>
                        )}
                      </td>
                      <td className="p-3 flex items-center space-x-2">
                        {!isSuper && (
                          <>
                            <select
                              value={u.status ?? 1}
                              onChange={(e) =>
                                handleStatusChange(u.id, Number(e.target.value))
                              }
                              className="px-2 py-1 border rounded text-xs bg-gray-50 font-medium cursor-pointer"
                            >
                              <option value={1}>Active</option>
                              <option value={0}>Banned</option>
                            </select>

                            <button
                              onClick={() =>
                                handleDeleteUser(u.id, u.role, u.email)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer"
                            >
                              Delete
                            </button>
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
  );
}
