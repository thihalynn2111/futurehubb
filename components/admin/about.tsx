"use client";
import React, { useEffect, useState } from "react";
import { Save, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import Swal from "sweetalert2";
type AboutCard = {
  id?: number;
  sectionID: number;
  type: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

type AboutSection = {
  id?: number;
  page: string | null;
  sectionKey: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  cards: AboutCard[];
};

export default function AboutSection() {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Record<string, File>>(
    {},
  );
  const [previewImages, setPreviewImages] = useState<Record<number, string>>(
    {},
  );
  const defaultSections: AboutSection[] = [
    {
      page: "about",
      sectionKey: "hero",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "about",
      sectionKey: "mission",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "about",
      sectionKey: "vision",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "about",
      sectionKey: "why choose us",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "about",
      sectionKey: "team",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
  ];

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
        const response = await fetch("/api/admin/pages/about");
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch about data");
        }
        const mergedSections = defaultSections.map((defaultSection) => {
          const existingSection = result.data.find(
            (item: AboutSection) =>
              item.sectionKey === defaultSection.sectionKey,
          );

          return existingSection || defaultSection;
        });

        setSections(mergedSections);
      } catch (error) {
        console.error("Error fetching sections:", error);
        setError("Error fetching sections");
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
  const canRead = hasPermission("aboutsection:read");
  const canUpdate = hasPermission("aboutsection:update");

  const handleInputChange = (id: number, field: string, value: string) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    );
  };

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
          if (!section.id) return section;

          const file = selectedImages[section.id];
          if (!file) return section;

          const formData = new FormData();
          formData.append("file", file);

          const uploadResponse = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadResult.success) {
            throw new Error(uploadResult.message || "Image upload failed");
          }

          return {
            ...section,
            imageUrl: uploadResult.imageUrl,
          };
        }),
      );

      const response = await fetch("/api/admin/pages/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections: updatedSections }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Error saving sections");
      }
      Swal.fire({
        title: "Success!",
        text: " Updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error saving sections:", error);
      setError("Error saving sections");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-sans">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading sections...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-gray-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <span className="text-orange-600 text-xs font-bold tracking-widest uppercase">
            Configuration
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            About Page Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your about page content, sections, and details.
          </p>
        </div>
        {canUpdate && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {sections.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          No sections found.
        </div>
      )}

      <form className="space-y-6">
        {sections.map((section) => {
          const sectionTitle = section.sectionKey
            ? section.sectionKey.charAt(0).toUpperCase() +
              section.sectionKey.slice(1) +
              " Section"
            : "Section";

          return (
            <div
              key={section.id ?? `default-${section.sectionKey}`}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2 border-b border-gray-100 pb-4">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                <span>{sectionTitle}</span>
              </h2>

              <div className="space-y-4">
                {/* Hero Section */}
                {section.sectionKey === "hero" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={section.title ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            section.id!,
                            "title",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter hero title..."
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
                            section.id!,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter hero description..."
                      />
                    </div>
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section Image
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-[200px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                          {(section.id && previewImages[section.id]) ||
                          section.imageUrl ? (
                            <img
                              src={
                                (section.id && previewImages[section.id]) ||
                                section.imageUrl!
                              }
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

                        <div>
                          <label
                            htmlFor={`bg-${section.id}`}
                            className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
                          >
                            <Upload size={16} className="text-orange-600" />
                            <span>Choose New Image</span>
                          </label>
                          <input
                            id={`bg-${section.id}`}
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && section.id) {
                                const previewUrl = URL.createObjectURL(file);
                                setSelectedImages((previous) => ({
                                  ...previous,
                                  [section.id!]: file,
                                }));
                                setPreviewImages((previous) => ({
                                  ...previous,
                                  [section.id!]: previewUrl,
                                }));
                              }
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Recommended size: 800x500px (PNG, JPG)
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Roadmap Section */}
                {section.sectionKey === "mission" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={section.title ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            section.id!,
                            "title",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter title..."
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
                            section.id!,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter description..."
                      />
                    </div>
                  </>
                )}

                {/* vision Section */}
                {section.sectionKey === "vision" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={section.title ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            section.id!,
                            "title",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter title..."
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
                            section.id!,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter description..."
                      />
                    </div>
                  </>
                )}

                {/* why choose us Section */}
                {section.sectionKey === "why choose us" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={section.title ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            section.id!,
                            "title",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter title..."
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
                            section.id!,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter description..."
                      />
                    </div>
                  </>
                )}

                {section.sectionKey === "team" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={section.title ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            section.id!,
                            "title",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter hero title..."
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
                            section.id!,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter hero description..."
                      />
                    </div>
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section Image
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-[200px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                          {(section.id && previewImages[section.id]) ||
                          section.imageUrl ? (
                            <img
                              src={
                                (section.id && previewImages[section.id]) ||
                                section.imageUrl!
                              }
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

                        <div>
                          <label
                            htmlFor={`bg-${section.id}`}
                            className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
                          >
                            <Upload size={16} className="text-orange-600" />
                            <span>Choose New Image</span>
                          </label>
                          <input
                            id={`bg-${section.id}`}
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && section.id) {
                                const previewUrl = URL.createObjectURL(file);
                                setSelectedImages((previous) => ({
                                  ...previous,
                                  [section.id!]: file,
                                }));
                                setPreviewImages((previous) => ({
                                  ...previous,
                                  [section.id!]: previewUrl,
                                }));
                              }
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Recommended size: 800x500px (PNG, JPG)
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom Save Button */}
        {/* <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-8 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
          </button>
        </div> */}
      </form>
    </div>
  );
}
