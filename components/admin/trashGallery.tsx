"use client";
import { useState, useEffect } from "react";
import { RotateCcw, User, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
type gallery = {
  id?: number;
  imageUrl: string;
  title: string;
  sortOrder?: number;
};

export default function TrashGallery() {
  const router = useRouter();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [gallery, setGallery] = useState<gallery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.user) {
            setUserRoles(meData.user.roles || []);
            setUserPermissions(meData.user.permissions || []);
          }
        }
        const response = await fetch("/api/admin/gallery");
        const result = await response.json();
        if (result.success) {
          setGallery(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch team members");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching team members");
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

  // 🌟 Unified HOme Permissions Matrix
  const canRead = hasPermission("gallery:read");
  const canUpdate = hasPermission("gallery:update");
  const canDelete = hasPermission("gallery:delete");
  const canCreate = hasPermission("gallery:create");
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
      const response = await fetch(`/api/admin/gallery/trash/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete gallery");
      }

      setGallery((previous) => previous.filter((gallery) => gallery.id !== id));
      Swal.fire({
        title: "Success!",
        text: "Gallery deleted successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("DELETE GALLERY ERROR:", error);
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
      const response = await fetch(`/api/admin/gallery/trash/${id}`, {
        method: "PUT",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete gallery");
      }

      setGallery((previous) => previous.filter((gallery) => gallery.id !== id));
      Swal.fire({
        title: "Success!",
        text: "Team gallery restore successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("RESTORE GALLERY ERROR:", error);
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Something went wrong",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-900 font-sans">
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <span className="text-blue-600 text-xs font-bold tracking-widest uppercase">
            Gallery Management
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            Gallery
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your gallery</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/gallery`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-center py-2.5 px-8 rounded-xl shadow-sm transition flex items-center disabled:opacity-50"
          >
            <span>View gallery list</span>
          </button>
        </div>
      </div>
      {gallery.length == 0 ? (
        <div>
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
            No Gallery
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((gallery: any) => (
              <div
                key={gallery.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Member Image / Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-inner mb-3">
                      {gallery.imageUrl ? (
                        <img
                          src={gallery.imageUrl}
                          alt={gallery.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={36} className="text-gray-300" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 text-center">
                      {gallery.title}
                    </h2>
                    <span className="text-blue-600 text-xs font-semibold tracking-wider uppercase mt-0.5">
                      {gallery.date
                        ? new Date(gallery.date).toISOString().split("T")[0]
                        : "-"}
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  {canUpdate && (
                    <button
                      onClick={() => handleRestore(gallery.id)}
                      className="flex-1 bg-red-50 hover:bg-green-100 text-green-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                    >
                      <RotateCcw size={16} />
                      <span>Restore</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(gallery.id)}
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
        </div>
      )}
    </div>
  );
}
