"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Loader2,
  Edit3,
  Trash2,
  User,
  RotateCcw,
  FolderKanban,
} from "lucide-react";
import Swal from "sweetalert2";
export default function ViewProjects() {
  const router = useRouter();

  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.user) {
            setUserRoles(meData.user.roles || []);
            setUserPermissions(meData.user.permissions || []);
          }
        }
        const response = await fetch("/api/admin/projects/trash");
        const result = await response.json();

        if (result.success) {
          setProjects(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching projects");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const isSuperAdmin = userRoles.some((role) => {
    const r = role.toLowerCase().replace(/[\s_-]/g, "");
    return (
      r.includes("superadmin") || r === "admin" || r === "superadministrator"
    );
  });

  const hasPermission = (permissionKey: string) => {
    return isSuperAdmin || userPermissions.includes(permissionKey);
  };

  const canUpdate = hasPermission("viewmember:update");
  const canDelete = hasPermission("viewmember:delete");
  async function handleDelete(id: number) {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmed.isConfirmed) return;
    try {
      const response = await fetch(`/api/admin/projects/trash/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete partner");
      }

      setProjects((previous) =>
        previous.filter((project) => project.id !== id),
      );
      Swal.fire({
        title: "Success!",
        text: "Partner & project deleted successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("DELETE PARTNER ERROR:", error);
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Something went wrong",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
  async function handleRestore(id: number) {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You want to restore this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, restore it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmed.isConfirmed) return;
    try {
      const response = await fetch(`/api/admin/projects/trash/${id}`, {
        method: "PUT",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to restore partner");
      }

      setProjects((previous) =>
        previous.filter((project) => project.id !== id),
      );
      Swal.fire({
        title: "Success!",
        text: "Partner restore successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("RESTORE PARTNER ERROR:", error);
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Something went wrong",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-sans">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading projects...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <span className="text-blue-600 text-xs font-bold tracking-widest uppercase">
            Partner and Project Management
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            Projects
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/projectSection`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-center py-2.5 px-8 rounded-xl shadow-sm transition flex items-center disabled:opacity-50"
          >
            <span>View partner and project list</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Project Image / Logo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-inner mb-3">
                    {project.clientLogo ? (
                      <img
                        src={project.clientLogo}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderKanban size={36} className="text-gray-300" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 text-center">
                    {project.title}
                  </h2>
                  <span className="text-blue-600 text-xs font-semibold tracking-wider uppercase mt-0.5">
                    {project.subtitle || "Project"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm text-center mb-6 line-clamp-3">
                  {project.description
                    ? project.description
                    : "No description provided."}
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                {canUpdate && (
                  <button
                    onClick={() => handleRestore(project.id)}
                    className="flex-1 bg-red-50 hover:bg-green-100 text-green-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                  >
                    <RotateCcw size={16} />
                    <span>Restore</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
