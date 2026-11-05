"use client";

import React, { useState, useEffect } from "react";

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
        setPermissions(permsData);
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

  const handleDeletePermission = async (id: number) => {
    if (!confirm("ဒီ Permission ကို အမှန်တကယ် ဖျက်မှာ သေချာပါသလား?")) return;

    try {
      const res = await fetch(`/api/admin/permissions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Permission Deleted Successfully! 🗑️");
        fetchData();
      } else {
        alert("Failed to delete permission");
      }
    } catch (err) {
      console.error("Error deleting permission:", err);
      alert("Something went wrong.");
    }
  };

  const predefinedResources = [
    { key: "posts", label: "Products / Posts" },
    { key: "projects", label: "Projects" },
    { key: "roles", label: "Roles Management" },
    { key: "users", label: "User Management" },
    { key: "inquiries", label: "Inquiries" },
    { key: "site_settings", label: "Site Settings" },
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

      {/* 1. EDIT PERMISSIONS MATRIX (Dynamic) */}
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
              className="w-full px-3 py-2 border rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 bg-gray-50"
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

                  return (
                    <tr key={resKey} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold uppercase">{resKey}</td>

                      {["create", "read", "update", "delete"].map(
                        (actionType) => {
                          // 🔒 Inquiries အတွက် CREATE နေရာတွင် Lock Icon ထည့်သွင်းခြင်း
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              onClick={handleSaveRolePermissions}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition"
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
                <th className="p-3">ACTIONS</th>
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
                  <td className="p-3">
                    <button
                      onClick={() => handleDeletePermission(p.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
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
              className="w-full px-3 py-2 border rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
              className="w-full px-3 py-2 border rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition"
            >
              💾 Save Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
