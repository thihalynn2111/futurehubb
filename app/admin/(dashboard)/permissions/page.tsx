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

  const uniqueResourcesFromDb = Array.from(
    new Set(permissions.map((p) => p.resource.toLowerCase())),
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 p-4 md:p-8">
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
      </div>

      {/* ========================================= */}
      {/* 1. PERMISSIONS MATRIX */}
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

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative table-fixed">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm shadow-sm">
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 font-semibold w-[45%]">Resource</th>
                <th className="py-3 px-1 font-semibold text-center w-14">
                  Create
                </th>
                <th className="py-3 px-1 font-semibold text-center w-14">
                  Read
                </th>
                <th className="py-3 px-1 font-semibold text-center w-14">
                  Update
                </th>
                <th className="py-3 px-1 font-semibold text-center w-14">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {uniqueResourcesFromDb.map((resKey, index) => {
                const getPerm = (action: string) => {
                  return permissions.find(
                    (p) =>
                      p.resource.toLowerCase() === resKey &&
                      p.action.toLowerCase() === action,
                  );
                };

                return (
                  <tr
                    key={resKey}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-800 capitalize truncate">
                      {resKey.replace("_", " ")}
                    </td>

                    {["create", "read", "update", "delete"].map(
                      (actionType) => {
                        const isLockedCell =
                          (resKey.toLowerCase() === "inquiries" &&
                            actionType === "create") ||
                          (resKey.toLowerCase() === "site_settings" &&
                            (actionType === "create" ||
                              actionType === "delete")) ||
                          (resKey.toLowerCase() === "seo" &&
                            (actionType === "create" ||
                              actionType === "delete"));

                        const perm = getPerm(actionType);

                        // 🚀 Lock ချထားတဲ့ ကွက်တွေ ဒါမှမဟုတ် Permission မရှိတဲ့ ကွက်လပ်တွေမှာ 🔒 ပြမယ်
                        if (isLockedCell || !perm) {
                          return (
                            <td
                              key={actionType}
                              className="py-3 px-1 text-center"
                              title="Action is disabled or not applicable"
                            >
                              <span className="text-gray-300 text-sm">🔒</span>
                            </td>
                          );
                        }

                        // ကျန်တဲ့ နေရာတွေမှာ Checkbox ပြမယ်
                        return (
                          <td
                            key={actionType}
                            className="py-3 px-1 text-center"
                          >
                            <input
                              type="checkbox"
                              checked={assignedPermissionIds.includes(perm.id)}
                              onChange={() => handleCheckboxChange(perm.id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110 mx-auto"
                            />
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

        {/* Save Permissions ခလုတ်ကို ချန်ထားပါတယ် */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleSaveRolePermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-xl transition shadow-sm text-sm"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
