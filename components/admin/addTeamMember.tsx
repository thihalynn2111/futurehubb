"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import {
  Save,
  Loader2,
  User,
  Briefcase,
  FileText,
  ListOrdered,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

type teamMember = {
  id?: number;
  name: string;
  position: string;
  imageUrl: string;
  bio: string;
  sortOrder: number;
};

export default function TeamMember() {
  const [formData, setFormData] = useState<teamMember>({
    name: "",
    position: "",
    bio: "",
    imageUrl: "",
    sortOrder: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "sortOrder" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
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
      }

      // STEP 2: Insert team member
      const response = await fetch("/api/admin/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        await Swal.fire({
          title: "Error!",
          text: result.message || "Failed to add member.",
          icon: "error",
        });
        return;
      }

      setMessage("Team member added successfully!");
      Swal.fire({
        title: "Success!",
        text: "Team member added successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      // STEP 3: Reset form
      setFormData({
        name: "",
        position: "",
        bio: "",
        imageUrl: "",
        sortOrder: 0,
      });

      setSelectedImage(null);
      setPreviewImage("");

      const fileInput = document.getElementById("img") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("ADD TEAM MEMBER ERROR:", error);
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Something went wrong",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <span className="text-blue-600 text-xs font-bold tracking-widest uppercase">
          Team Management
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
          Add Team Member
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Add a new team member profile, position, and bio.
        </p>
      </div>

      {message && !message.includes("success") && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
      >
        {/* Profile Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
            <ImageIcon size={16} className="text-blue-600 mr-1" />
            <span>Profile Image</span>
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-[140px] h-[140px] bg-gray-50 border border-gray-200 rounded-full overflow-hidden flex items-center justify-center relative shadow-inner">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Team member preview"
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
                <Upload size={16} className="text-blue-600" />
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
        </div>

        {/* Name */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="name"
          >
            <User size={16} className="text-blue-600 mr-1" />
            <span>Name</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
            placeholder="Enter full name..."
          />
        </div>

        {/* Position */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="position"
          >
            <Briefcase size={16} className="text-blue-600 mr-1" />
            <span>Position</span>
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
            placeholder="Enter position / job title..."
          />
        </div>

        {/* Bio */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="bio"
          >
            <FileText size={16} className="text-blue-600 mr-1" />
            <span>Bio</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
            placeholder="Enter short biography..."
          />
        </div>

        {/* Sort Order */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
            htmlFor="sortOrder"
          >
            <ListOrdered size={16} className="text-blue-600 mr-1" />
            <span>Sort Order</span>
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-55"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{loading ? "Adding Member..." : "Add Team Member"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
