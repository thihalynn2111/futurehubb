"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<number[]>(
    [],
  );
  const [toast, setToast] = useState("");

  // Create Permission States
  const [selectedResource, setSelectedResource] = useState("");
  const [customResource, setCustomResource] = useState("");
  const [selectedAction, setSelectedAction] = useState("create");
  const [description, setDescription] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/permissions"),
      ]);
      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      if (Array.isArray(rolesData)) {
        const activeRoles = rolesData.filter((r: any) => !r.deletedAt);
        setRoles(activeRoles);

        if (
          activeRoles.length > 0 &&
          (!selectedRoleId ||
            !activeRoles.some((r) => r.id.toString() === selectedRoleId))
        ) {
          setSelectedRoleId(activeRoles[0].id.toString());
        } else if (activeRoles.length === 0) {
          setSelectedRoleId("");
        }
      }
      if (Array.isArray(permsData)) {
        setPermissions(permsData.filter((p: any) => !p.deletedAt));
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    const fetchRolePermissions = async () => {
      try {
        const res = await fetch(
          `/api/admin/role-permissions?roleId=${selectedRoleId}`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setAssignedPermissionIds(data.map((rp: any) => rp.permissionId));
        }
      } catch (err: any) {
        console.error("Failed to fetch role permissions:", err);
      }
    };
    fetchRolePermissions();
  }, [selectedRoleId]);

  const handleCheckboxChange = (permId: number) => {
    if (assignedPermissionIds.includes(permId)) {
      setAssignedPermissionIds(
        assignedPermissionIds.filter((id) => id !== permId),
      );
    } else {
      setAssignedPermissionIds([...assignedPermissionIds, permId]);
    }
  };

  const handleSaveRolePermissions = async () => {
    try {
      const res = await fetch("/api/admin/role-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: parseInt(selectedRoleId),
          permissionIds: assignedPermissionIds,
        }),
      });

      if (res.ok) {
        showToast("Permissions Saved Successfully! ✅");
      } else {
        alert("Failed to save permissions");
      }
    } catch (err) {
      console.error("Error saving role permissions:", err);
      alert("Something went wrong.");
    }
  };

  const finalResource =
    selectedResource === "custom"
      ? customResource.trim().toLowerCase()
      : selectedResource;
  const generatedPermName = `${finalResource}:${selectedAction}`;

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalResource) {
      alert("ကျေးဇူးပြု၍ Resource ကို ရွေးပါ သို့မဟုတ် အသစ်ထည့်ပါ။");
      return;
    }

    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedPermName,
          resource: finalResource,
          action: selectedAction,
          description:
            description ||
            `${finalResource.toUpperCase()} များကို ${selectedAction} လုပ်ခွင့်`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Permission Created Successfully! ✅");
        setSelectedResource("");
        setCustomResource("");
        setDescription("");
        fetchData();
      } else {
        alert(data.error || "Failed to create permission");
      }
    } catch (err) {
      console.error("Error creating permission:", err);
      alert("Something went wrong.");
    }
  };

  const handleSoftDeletePermission = async (id: number, name: string) => {
    if (
      !confirm(`⚠️ Permission '${name}' ကို Trash သို့ ပို့ရန် သေချာပါသလား?`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/permissions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Permission moved to trash! 🗑️");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to trash permission");
      }
    } catch (err) {
      console.error("Error trashing permission:", err);
      alert("Something went wrong.");
    }
  };

  const predefinedResources = [
    { key: "products", label: "Products" },
    { key: "inquiries", label: "Inquiries" },
    { key: "users", label: "Users" },
    { key: "roles", label: "Roles" },
    { key: "site_settings", label: "Site Settings" },
    { key: "teammember", label: "Team Member" },
    { key: "projects", label: "Project" },
    { key: "gallery", label: "Gallery" },
    { key: "page-sections", label: "page-sections" },
  ];

  const uniqueResourcesFromDb = Array.from(
    new Set(permissions.map((p) => p.resource.toLowerCase())),
  );

  const inputClass =
    "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 p-4 md:p-8">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl font-medium z-50 text-sm">
          {toast}
        </div>
      )}

      {/* 🟢 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage what actions each role can perform across the system.
          </p>
        </div>
        <Link
          href="/admin/permissions/trash"
          className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
        >
          View Trash
        </Link>
      </div>

      {/* ========================================= */}
      {/* 1. PERMISSIONS MATRIX (အပေါ်ပိုင်း) */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">
            Role Permissions Matrix
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Select Role:
            </span>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:border-blue-500 bg-gray-50 cursor-pointer min-w-[200px]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} ({r.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6 font-semibold">Resource</th>
                <th className="py-4 px-4 font-semibold text-center">Create</th>
                <th className="py-4 px-4 font-semibold text-center">Read</th>
                <th className="py-4 px-4 font-semibold text-center">Update</th>
                <th className="py-4 px-4 font-semibold text-center">Delete</th>
                <th className="py-4 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {uniqueResourcesFromDb.map((resKey) => {
                const getPerm = (action: string) => {
                  return permissions.find(
                    (p) =>
                      p.resource.toLowerCase() === resKey &&
                      p.action.toLowerCase() === action,
                  );
                };

                const handleSoftDeleteRow = async () => {
                  if (
                    !confirm(
                      `Move all permissions for '${resKey.toUpperCase()}' to trash?`,
                    )
                  )
                    return;

                  try {
                    const resourcePerms = permissions.filter(
                      (p) => p.resource.toLowerCase() === resKey.toLowerCase(),
                    );
                    for (const p of resourcePerms) {
                      await fetch(`/api/admin/permissions/${p.id}`, {
                        method: "DELETE",
                      });
                    }
                    showToast(
                      `Resource '${resKey.toUpperCase()}' moved to trash!`,
                    );
                    fetchData();
                  } catch (err) {
                    alert("Failed to trash resource row");
                  }
                };

                return (
                  <tr
                    key={resKey}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-800 capitalize">
                      {resKey.replace("_", " ")}
                    </td>

                    {["create", "read", "update", "delete"].map(
                      (actionType) => {
                        const isLockedCell =
                          (resKey.toLowerCase() === "inquiries" &&
                            actionType === "create") ||
                          (resKey.toLowerCase() === "site_settings" &&
                            (actionType === "create" ||
                              actionType === "delete"));

                        if (isLockedCell) {
                          return (
                            <td
                              key={actionType}
                              className="py-4 px-4 text-center"
                              title="Action is disabled"
                            >
                              <span className="text-gray-300 text-lg">🔒</span>
                            </td>
                          );
                        }

                        const perm = getPerm(actionType);
                        return (
                          <td
                            key={actionType}
                            className="py-4 px-4 text-center"
                          >
                            {perm ? (
                              <input
                                type="checkbox"
                                checked={assignedPermissionIds.includes(
                                  perm.id,
                                )}
                                onChange={() => handleCheckboxChange(perm.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      },
                    )}

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={handleSoftDeleteRow}
                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                      >
                        Trash Row
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleSaveRolePermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition shadow-sm text-sm"
          >
            Save Permissions
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. CREATE NEW PERMISSION (အောက်ပိုင်း) */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-2xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Create New Permission
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Add a new action to the system.
          </p>
        </div>

        <form onSubmit={handleCreatePermission} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource
              </label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select Resource</option>
                {predefinedResources.map((res) => (
                  <option key={res.key} value={res.key}>
                    {res.label} ({res.key})
                  </option>
                ))}
                <option value="custom">➕ Custom Resource</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className={inputClass}
              >
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          </div>

          {selectedResource === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Resource Name
              </label>
              <input
                type="text"
                required
                value={customResource}
                onChange={(e) => setCustomResource(e.target.value)}
                placeholder="e.g. reports"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated Permission Name
            </label>
            <input
              type="text"
              disabled
              value={finalResource ? generatedPermName : ""}
              placeholder="resource:action"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Allow users to..."
              className={inputClass}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-gray-900 hover:bg-black text-white font-medium px-6 py-2 rounded-lg transition text-sm"
            >
              Create Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
