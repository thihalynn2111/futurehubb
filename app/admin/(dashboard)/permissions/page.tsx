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
        setRoles(rolesData);
        if (rolesData.length > 0 && !selectedRoleId) {
          setSelectedRoleId(rolesData[0].id.toString());
        }
      }
      if (Array.isArray(permsData)) {
        // Active permissions များကိုသာ စစ်ထုတ်ယူခြင်း (deletedAt မပါသည်များ)
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

  // 🗑️ Soft Delete Single Permission
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

  // 🔥 Predefined Resources
  const predefinedResources = [
    { key: "inquiries", label: "Inquiries" },
    { key: "categories", label: "Product Categories" },
    { key: "posts", label: "Product Posts" },
    { key: "cards", label: "Card Items" },
    { key: "users", label: "User Management" },
    { key: "roles", label: "Roles Management" },
    { key: "site_settings", label: "Site Settings" },
    { key: "home", label: "Home" },
  ];

  const uniqueResourcesFromDb = Array.from(
    new Set(permissions.map((p) => p.resource.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      {/* Header View Trash Link */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-950">
            Permission Management Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define and configure role access control matrices.
          </p>
        </div>
        <Link
          href="/admin/permissions/trash"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          🗑️ View Trash Bin
        </Link>
      </div>

      {/* 1. EDIT PERMISSIONS MATRIX (Dynamic with Trash Row Button) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 font-bold text-lg">
          🔐 Edit Permissions (CRUD Matrix)
        </div>
        <div className="p-6 space-y-4">
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Role:
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} ({r.name})
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                  <th className="p-3">RESOURCE</th>
                  <th className="p-3 text-center">CREATE</th>
                  <th className="p-3 text-center">READ</th>
                  <th className="p-3 text-center">UPDATE</th>
                  <th className="p-3 text-center">DELETE</th>
                  <th className="p-3 text-right">ROW ACTION</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y text-gray-800">
                {uniqueResourcesFromDb.map((resKey) => {
                  const getPerm = (action: string) => {
                    return permissions.find(
                      (p) =>
                        p.resource.toLowerCase() === resKey &&
                        p.action.toLowerCase() === action,
                    );
                  };

                  // 🗑️ Handle soft deleting all permissions in this resource row
                  const handleSoftDeleteRow = async () => {
                    if (
                      !confirm(
                        `⚠️ Move all permissions for resource '${resKey.toUpperCase()}' to trash?`,
                      )
                    ) {
                      return;
                    }

                    try {
                      const resourcePerms = permissions.filter(
                        (p) =>
                          p.resource.toLowerCase() === resKey.toLowerCase(),
                      );

                      for (const p of resourcePerms) {
                        await fetch(`/api/admin/permissions/${p.id}`, {
                          method: "DELETE",
                        });
                      }

                      showToast(
                        `Resource '${resKey.toUpperCase()}' moved to trash! 🗑️`,
                      );
                      fetchData();
                    } catch (err) {
                      console.error("Error trashing resource row:", err);
                      alert("Failed to trash resource row");
                    }
                  };

                  return (
                    <tr key={resKey} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold uppercase">{resKey}</td>

                      {["create", "read", "update", "delete"].map(
                        (actionType) => {
                          if (
                            resKey.toLowerCase() === "inquiries" &&
                            actionType === "create"
                          ) {
                            return (
                              <td
                                key={actionType}
                                className="p-3 text-center"
                                title="Inquiry creation is disabled"
                              >
                                <span className="inline-flex items-center justify-center text-gray-400 font-bold cursor-not-allowed">
                                  🔒
                                </span>
                              </td>
                            );
                          }

                          const perm = getPerm(actionType);
                          return (
                            <td key={actionType} className="p-3 text-center">
                              {perm ? (
                                <input
                                  type="checkbox"
                                  checked={assignedPermissionIds.includes(
                                    perm.id,
                                  )}
                                  onChange={() => handleCheckboxChange(perm.id)}
                                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                          );
                        },
                      )}

                      {/* 🗑️ Trash Row Button */}
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={handleSoftDeleteRow}
                          className="px-2.5 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-md text-xs font-semibold cursor-pointer transition"
                          title={`Trash all ${resKey} permissions`}
                        >
                          🗑️ Trash Row
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              onClick={handleSaveRolePermissions}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition cursor-pointer"
            >
              💾 Save Permissions Matrix
            </button>
          </div>
        </div>
      </div>

      {/* 2. PERMISSION MANAGEMENT TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 font-bold text-lg">
          🔑 Permission Management (ခွင့်ပြုချက် စာရင်း)
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                <th className="p-3">ID</th>
                <th className="p-3">PERMISSION NAME</th>
                <th className="p-3">RESOURCE</th>
                <th className="p-3">DESCRIPTION</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y text-gray-800">
              {permissions.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">
                    <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono font-bold text-xs">
                      {p.name}
                    </code>
                  </td>
                  <td className="p-3 font-semibold uppercase">{p.resource}</td>
                  <td className="p-3">{p.description}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleSoftDeletePermission(p.id, p.name)}
                      className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-md text-xs font-semibold cursor-pointer transition"
                    >
                      🗑️ Trash
                    </button>
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No active permissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CREATE NEW PERMISSION FORM */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-xl">
        <div className="bg-slate-900 text-white px-6 py-4 font-bold text-lg">
          🔑 Create New Permission (အသစ်ဖန်တီးရန်)
        </div>
        <form onSubmit={handleCreatePermission} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Resource:
            </label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer"
              required
            >
              <option value="">-- Select Resource --</option>
              {predefinedResources.map((res) => (
                <option key={res.key} value={res.key}>
                  {res.key} ({res.label})
                </option>
              ))}
              <option value="custom">
                ➕ Add Custom Resource (အသစ်ထည့်ရန်)
              </option>
            </select>
          </div>

          {selectedResource === "custom" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Custom Resource Name (ဥပမာ - hello, authors):
              </label>
              <input
                type="text"
                required
                value={customResource}
                onChange={(e) => setCustomResource(e.target.value)}
                placeholder="resource_name"
                className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Action:
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-pointer"
            >
              <option value="create">create</option>
              <option value="read">read</option>
              <option value="update">update</option>
              <option value="delete">delete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Generated Permission Name (အလိုအလျောက် ပေါ်မည်):
            </label>
            <input
              type="text"
              disabled
              value={finalResource ? generatedPermName : ""}
              placeholder="resource:action"
              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description (ဖော်ပြချက်):
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ဖော်ပြချက်..."
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div style={{ marginTop: "15px", textAlign: "right" }}>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition cursor-pointer"
            >
              💾 Save Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
