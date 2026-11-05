"use client";
import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  User,
  Briefcase,
  FileText,
  Upload,
  ListOrdered,
} from "lucide-react";
import Swal from "sweetalert2";
type EditMemberProps = {
  id: number;
};

export default function EditMember({ id }: EditMemberProps) {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    imageUrl: "",
    sortOrder: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/team-members/${id}`);
        const result = await response.json();
        if (result.success && result.data) {
          setMember(result.data);
          setFormData({
            name: result.data.name || "",
            position: result.data.position || "",
            bio: result.data.bio || "",
            imageUrl: result.data.imageUrl || "",
            sortOrder: result.data.sortOrder || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-400px text-gray-500 font-sans">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading member
        details...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center text-red-500 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto mt-10 font-sans">
        Member not found.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <span className="text-orange-600 text-xs font-bold tracking-widest uppercase">
          Team Management
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
          Edit Team Member
        </h1>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            setSaving(true);
            setMessage("");

            let imageUrl = "";

            // STEP 1: Upload image first
            if (selectedImage) {
              const uploadData = new FormData();
              uploadData.append("file", selectedImage);

              const uploadResponse = await fetch("/api/admin/upload", {
                method: "POST",
                body: uploadData,
              });

              const uploadResult = await uploadResponse.json();

              if (!uploadResponse.ok || !uploadResult.success) {
                throw new Error("Image upload failed");
              }

              imageUrl = uploadResult.imageUrl;
              formData.imageUrl = imageUrl;
            }
            const response = await fetch(`/api/admin/team-members/${id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify(formData),
            });

            const result = await response.json();

            console.log("API Response Status:", response.status);
            console.log("API Response Body:", result);

            if (!response.ok || !result.success) {
              throw new Error(result.message || "Failed to update member");
            }

            Swal.fire({
              title: "Success!",
              text: "Team member edited successfully!",
              icon: "success",
              confirmButtonText: "OK",
            });
          } catch (error: any) {
            console.error("Detailed Error:", error);
            Swal.fire({
              title: "Error!",
              text: error.message || "Something went wrong",
              icon: "error",
              confirmButtonText: "OK",
            });
          } finally {
            setSaving(false);
          }
        }}
        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
      >
        {/* Profile Image Preview */}
        <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-[140px] h-[140px] bg-gray-50 border border-gray-200 rounded-full overflow-hidden flex items-center justify-center relative shadow-inner">
              {previewImage || formData.imageUrl ? (
                <img
                  src={previewImage || formData.imageUrl}
                  alt="Partner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 text-xs">
                  <User size={32} className="mb-1 text-gray-300" />
                  <span>No image</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="img"
                className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
              >
                <Upload size={16} className="text-orange-600" />
                <span>Choose Profile Photo</span>
              </label>
              <input
                id="img"
                hidden
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-400 mt-2">
                Recommended: Square PNG, JPG (Max 5MB)
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400">Member Profile</span>
        </div>

        {/* Name Input */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="name"
          >
            <User size={16} className="text-orange-600 mr-1" />
            <span>Name</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
            placeholder="Enter full name..."
          />
        </div>

        {/* Position Input */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="position"
          >
            <Briefcase size={16} className="text-orange-600 mr-1" />
            <span>Position</span>
          </label>
          <input
            type="text"
            id="position"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
            placeholder="Enter job position / title..."
          />
        </div>

        {/* Bio Textarea */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="bio"
          >
            <FileText size={16} className="text-orange-600 mr-1" />
            <span>Bio</span>
          </label>
          <textarea
            id="bio"
            value={formData.bio ?? ""}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
            rows={4}
            placeholder="Enter short biography..."
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="sortOrder"
          >
            <ListOrdered size={16} className="text-orange-600 mr-1" />
            <span>Sort Order</span>
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: Number(e.target.value) })
            }
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
          />
        </div>
        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-8 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-55"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{saving ? "Updating..." : "Update Member"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
