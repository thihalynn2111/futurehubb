"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  Save,
  Loader2,
  Image as ImageIcon,
  Upload,
  FileText,
  Type,
  ListOrdered,
} from "lucide-react";

type Project = {
  title: string;
  subtitle: string;
  description: string;
  clientLogo: string;
  sortOrder: number;
};

export default function AddProject() {
  const [formData, setFormData] = useState<Project>({
    title: "",
    subtitle: "",
    description: "",
    clientLogo: "",
    sortOrder: 0,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Image Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "sortOrder" ? Number(value) : value,
    }));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let imageUrl = "";

      // STEP 1: Upload Project Image
      if (selectedImage) {
        const uploadData = new FormData();
        uploadData.append("file", selectedImage);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || "Image upload failed");
        }

        imageUrl = uploadResult.imageUrl;
      }

      // STEP 2: Create New Project
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          clientLogo: imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add project");
      }

      // STEP 3: Success Message
      await Swal.fire({
        title: "Success!",
        text: "Project added successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      // STEP 4: Reset Form
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        clientLogo: "",
        sortOrder: 0,
      });

      setSelectedImage(null);
      setPreviewImage("");

      // Clear file input
      const fileInput = document.getElementById(
        "projectImage",
      ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
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
        <span className="text-orange-600 text-xs font-bold tracking-widest uppercase">
          Catalogue Management
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
          Add New Project
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new project entry with description, imagery, and details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
      >
        {/* Project Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
            <ImageIcon size={16} className="text-orange-600 mr-1" />
            <span>Project Image / Logo</span>
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-[180px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Project preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 text-xs">
                  <ImageIcon size={24} className="mb-1" />
                  <span>No image</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="projectImage"
                className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
              >
                <Upload size={16} className="text-orange-600" />
                <span>Choose Image</span>
              </label>
              <input
                id="projectImage"
                hidden
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-400 mt-2">
                Recommended format: PNG, JPG (Max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
          >
            <Type size={16} className="text-orange-600 mr-1" />
            <span>Partner Name</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
            placeholder="Enter partner name..."
          />
        </div>

        {/* Subtitle */}
        <div>
          <label
            htmlFor="subtitle"
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
          >
            <Type size={16} className="text-orange-600 mr-1" />
            <span>Project Title</span>
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
            placeholder="Enter project title..."
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
          >
            <FileText size={16} className="text-orange-600 mr-1" />
            <span>Description</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
            placeholder="Enter project detailed description..."
          />
        </div>

        {/* Sort Order */}
        <div>
          <label
            htmlFor="sortOrder"
            className="block text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1"
          >
            <ListOrdered size={16} className="text-orange-600 mr-1" />
            <span>Sort Order</span>
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-8 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-55"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{loading ? "Adding Project..." : "Add Project"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
