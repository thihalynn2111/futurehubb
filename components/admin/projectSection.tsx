"use client";

import React, { useEffect, useState } from "react";
import { Save, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

type ProjectSection = {
  id?: number;
  page: string | null;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
};

export default function ProjectSection() {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, File>>(
    {},
  );
  const [previewImages, setPreviewImages] = useState<Record<string, string>>(
    {},
  );

  // Default sections
  const defaultSections: ProjectSection[] = [
    {
      page: "home",
      sectionKey: "hero",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
    },
    {
      page: "home",
      sectionKey: "header",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
    },
  ];

  // 1. Fetch sections from database
  useEffect(() => {
    async function fetchSections() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.user) {
            setUserRoles(meData.user.roles || []);
            setUserPermissions(meData.user.permissions || []);
          }
        }
        const response = await fetch("/api/admin/pages/projectSection");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch sections");
        }

        const mergedSections = defaultSections.map((defaultSection) => {
          const existingSection = result.data.find(
            (item: ProjectSection) =>
              item.sectionKey === defaultSection.sectionKey,
          );

          return existingSection || defaultSection;
        });

        setSections(mergedSections);
      } catch (error) {
        console.error("Fetch error:", error);

        setError(
          error instanceof Error ? error.message : "Error fetching sections",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSections();
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
  const canRead = hasPermission("projectsection:read");
  const canUpdate = hasPermission("projectsection:update");

  // 2. Update section input values
  const handleInputChange = (
    sectionKey: string,
    field: keyof ProjectSection,
    value: string,
  ) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.sectionKey === sectionKey
          ? { ...section, [field]: value }
          : section,
      ),
    );
  };

  // 3. Select image and display preview
  const handleImageChange = (sectionKey: string, file?: File) => {
    if (!file) return;

    // Check image file type
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Please select an image file.", "error");
      return;
    }

    // Create temporary preview URL
    const previewUrl = URL.createObjectURL(file);

    // Save selected file
    setSelectedImages((previous) => ({
      ...previous,
      [sectionKey]: file,
    }));

    // Save preview URL
    setPreviewImages((previous) => ({
      ...previous,
      [sectionKey]: previewUrl,
    }));
  };

  // 4. Upload image and save section data
  const handleSave = async () => {
    try {
      const heroSection = sections.find((s) => s.sectionKey === "hero");
      const heroHasImage =
        !!selectedImages["hero"] || !!heroSection?.imageUrl?.trim();

      if (!heroHasImage) {
        Swal.fire({
          title: "Hero image required!",
          text: "Please upload a hero image before saving.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      setSaving(true);

      const updatedSections = await Promise.all(
        sections.map(async (section) => {
          const sectionFile = selectedImages[section.sectionKey];

          // If no new image is selected,
          // keep the existing database image
          if (!sectionFile) {
            return section;
          }

          // Upload new image
          const formData = new FormData();
          formData.append("file", sectionFile);

          const uploadResponse = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadResult.success) {
            throw new Error(uploadResult.message || "Image upload failed");
          }

          // Return section with new image URL
          return {
            ...section,
            imageUrl: uploadResult.imageUrl,
          };
        }),
      );

      // Save section data to database
      const response = await fetch("/api/admin/pages/gallerySection", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: updatedSections,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save sections");
      }

      // Update frontend with saved data
      setSections(updatedSections);

      // Clear selected files and preview URLs
      Object.values(previewImages).forEach((url) => {
        URL.revokeObjectURL(url);
      });

      setSelectedImages({});
      setPreviewImages({});

      Swal.fire({
        title: "Success!",
        text: "Updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Save error:", error);

      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Update failed",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // 5. Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="animate-spin mr-2" size={24} />
        Loading sections...
      </div>
    );
  }

  // 6. Main UI
  return (
    <div className="p-8 max-w-5xl mx-auto text-gray-900 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <span className="text-blue-600 text-xs font-bold tracking-widest uppercase">
            Configuration
          </span>

          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            Partner & Project Page Management
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Update your partner & project page sections, titles, descriptions,
            and images.
          </p>
        </div>
        {canUpdate && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}

            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          No sections found.
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            const sectionTitle =
              section.sectionKey.charAt(0).toUpperCase() +
              section.sectionKey.slice(1) +
              " Section";

            const imagePreview =
              previewImages[section.sectionKey] || section.imageUrl || "";

            return (
              <div
                key={section.sectionKey}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
              >
                {/* Section Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2 border-b border-gray-100 pb-4">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                  <span>{sectionTitle}</span>
                </h2>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Title
                    </label>

                    <input
                      type="text"
                      value={section.title ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          section.sectionKey,
                          "title",
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
                      placeholder="Enter section title..."
                    />
                  </div>

                  {/* Hero Image */}
                  {section.sectionKey === "hero" && (
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Image Preview */}
                        <div className="w-[200px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Section preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400 text-xs">
                              <ImageIcon size={24} className="mb-1" />
                              <span>No image</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button */}
                        <div>
                          <label
                            htmlFor={`bg-${section.sectionKey}`}
                            className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
                          >
                            <Upload size={16} className="text-blue-600" />
                            <span>Choose New Image</span>
                          </label>

                          <input
                            id={`bg-${section.sectionKey}`}
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleImageChange(
                                section.sectionKey,
                                e.target.files?.[0],
                              );

                              // Allow selecting the same file again
                              e.target.value = "";
                            }}
                          />

                          <p className="text-xs text-gray-400 mt-2">
                            Recommended size: 800x500px (PNG, JPG)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subtitle and Description */}
                  {section.sectionKey === "header" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Subtitle
                        </label>

                        <input
                          type="text"
                          value={section.subtitle ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              section.sectionKey,
                              "subtitle",
                              e.target.value,
                            )
                          }
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
                          placeholder="Enter subtitle..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Description
                        </label>

                        <textarea
                          value={section.description ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              section.sectionKey,
                              "description",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition text-sm"
                          placeholder="Enter section description..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
