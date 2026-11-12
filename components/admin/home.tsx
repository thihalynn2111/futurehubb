"use client";
import React, { useEffect, useState } from "react";

import {
  Save,
  Upload,
  Loader2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
type HomeCard = {
  id?: number;
  sectionID: number;
  type: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

type HomeSection = {
  id?: number;
  page: string | null;
  sectionKey: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  cards: HomeCard[];
};

type SeoPage = {
  id?: number;
  pageName: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string;
};

export default function Home() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Record<string, File>>(
    {},
  );

  const [previewImages, setPreviewImages] = useState<Record<string, string>>(
    {},
  );
  const [selectedCardImages, setSelectedCardImages] = useState<
    Record<string, File>
  >({});

  const [previewCardImages, setPreviewCardImages] = useState<
    Record<string, string>
  >({});
  const defaultSections: HomeSection[] = [
    {
      page: "home",
      sectionKey: "hero",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "home",
      sectionKey: "contact call to action",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "home",
      sectionKey: "about call to action",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "home",
      sectionKey: "roadmap",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
    {
      page: "home",
      sectionKey: "Technology",
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      cards: [],
    },
  ];
  const [seo, setSeo] = useState<SeoPage>({
    pageName: "home",
    metaTitle: "",
    metaDesc: "",
    keywords: "",
  });

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
        const response = await fetch("/api/admin/pages/home");
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch about data");
        }
        const mergedSections = defaultSections.map((defaultSection) => {
          const existingSection = result.data.find(
            (item: HomeSection) =>
              item.sectionKey === defaultSection.sectionKey,
          );

          return existingSection || defaultSection;
        });

        setSections(mergedSections);
        setSeo({
          id: result.seo?.id,
          pageName: result.seo?.pageName ?? "home",
          metaTitle: result.seo?.metaTitle ?? "",
          metaDesc: result.seo?.metaDesc ?? "",
          keywords: result.seo?.keywords ?? "",
        });
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
  const canRead = hasPermission("home:read");
  const canUpdate = hasPermission("home:update");

  async function handleDelete(id: number) {
    setLoading(true);
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
      const response = await fetch(`/api/admin/card/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete card");
      }
      setSections((previous) =>
        previous.map((section) => ({
          ...section,
          cards: section.cards.filter((card) => card.id !== id),
        })),
      );

      Swal.fire({
        title: "Success!",
        text: "Card deleted successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Something went wrong",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }
  const handleInputChange = (
    sectionKey: string,
    field: string,
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
          let updatedSection = { ...section };

          // 1. Upload Section Image
          const sectionFile = selectedImages[section.sectionKey ?? ""];

          if (sectionFile) {
            const formData = new FormData();
            formData.append("file", sectionFile);

            const uploadResponse = await fetch("/api/admin/upload", {
              method: "POST",
              body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadResult.success) {
              throw new Error(
                uploadResult.message || "Section image upload failed",
              );
            }

            updatedSection.imageUrl = uploadResult.imageUrl;
          }
          const updatedCards = await Promise.all(
            section.cards.map(async (card, cardIndex) => {
              const cardKey = `${section.id}-${card.id ?? `new-${cardIndex}`}`;

              const cardFile = selectedCardImages[cardKey];

              if (!cardFile) return card;

              const formData = new FormData();
              formData.append("file", cardFile);

              const uploadResponse = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
              });

              const uploadResult = await uploadResponse.json();

              if (!uploadResponse.ok || !uploadResult.success) {
                throw new Error(
                  uploadResult.message || "Card image upload failed",
                );
              }

              return {
                ...card,
                imageUrl: uploadResult.imageUrl,
              };
            }),
          );

          return {
            ...updatedSection,
            cards: updatedCards,
          };
        }),
      );

      const response = await fetch("/api/admin/pages/home", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections: updatedSections }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error saving sections");
      }
      Swal.fire({
        title: "Success!",
        text: "Updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Validation Error!",
        text: error instanceof Error ? error.message : "Something went wrong",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading sections...
      </div>
    );
  }
  // Update an existing card
  const handleCardInputChange = (
    sectionId: number,
    cardIndex: number,
    field: keyof HomeCard,
    value: string,
  ) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              cards: section.cards.map((card, index) =>
                index === cardIndex ? { ...card, [field]: value } : card,
              ),
            }
          : section,
      ),
    );
  };

  // Add a new card
  const handleAddCard = (sectionId: number) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              cards: [
                ...section.cards,
                {
                  sectionID: section.id!,
                  type: section.sectionKey,
                  title: "",
                  description: "",
                  subtitle: "",
                  imageUrl: "",
                },
              ],
            }
          : section,
      ),
    );
  };
  const handleRemoveCard = (sectionId: number, cardIndex: number) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              cards: section.cards.filter((_, index) => index !== cardIndex),
            }
          : section,
      ),
    );
  };
  return (
    <div className="p-8 max-w-5xl mx-auto text-gray-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <span className="text-orange-600 text-xs font-bold tracking-widest uppercase">
            Configuration
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            Home Page Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Update your home page sections, titles, descriptions, and media.
          </p>
        </div>
        {canUpdate ?? (
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
        {/* SEO Settings */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>

          {/* Meta Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Meta Title</label>

            <input
              type="text"
              value={seo.metaTitle}
              onChange={(e) =>
                setSeo((prev) => ({
                  ...prev,
                  metaTitle: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-3"
              placeholder="Enter meta title"
            />
          </div>

          {/* Meta Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Meta Description
            </label>

            <textarea
              value={seo.metaDesc}
              onChange={(e) =>
                setSeo((prev) => ({
                  ...prev,
                  metaDesc: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-3"
              rows={4}
              placeholder="Enter meta description"
            />
          </div>

          {/* Keywords */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Keywords</label>

            <input
              type="text"
              value={seo.keywords}
              onChange={(e) =>
                setSeo((prev) => ({
                  ...prev,
                  keywords: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg p-3"
              placeholder="Enter keywords separated by commas"
            />
          </div>
        </div>
        {sections.map((section) => {
          const sectionTitle = section.sectionKey
            ? section.sectionKey.charAt(0).toUpperCase() +
              section.sectionKey.slice(1) +
              " Section"
            : "Section";
          const imagePreview =
            (section.sectionKey ? previewImages[section.sectionKey] : "") ||
            section.imageUrl ||
            "";
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
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={section.title ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        section.sectionKey!,
                        "title",
                        e.target.value,
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                    placeholder="Enter section title..."
                  />
                </div>
                {(section.sectionKey === "hero" ||
                  section.sectionKey === "contact call to action" ||
                  section.sectionKey === "about call to action") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={section.subtitle ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          section.sectionKey!,
                          "subtitle",
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                      placeholder="Enter subtitle..."
                    />
                    <label className="block text-sm font-semibold text-gray-700 mb-1 mt-4">
                      Contact button label
                    </label>
                    <input
                      type="text"
                      value={section.description ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          section.sectionKey!,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                      placeholder="Enter button title..."
                    />
                  </div>
                )}

                {section.sectionKey === "roadmap" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={section.subtitle ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          section.sectionKey!,
                          "subtitle",
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                      placeholder="Enter subtitle..."
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={section.description ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            section.sectionKey!,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                        placeholder="Enter section description..."
                      />
                    </div>
                    {/* Card Management */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-800">
                          Manage Cards
                        </h3>

                        <button
                          type="button"
                          onClick={() => handleAddCard(section.id!)}
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          + Add Card
                        </button>
                      </div>

                      {section.cards.map((card, cardIndex) => (
                        <div
                          key={card.id ?? `new-${section.id}-${cardIndex}`}
                          className="border border-gray-200 rounded-xl p-5 mb-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-700">
                              Card {cardIndex + 1}
                            </h4>

                            <span className="text-xs text-gray-400">
                              <button
                                type="button"
                                onClick={() => {
                                  if (card.id) {
                                    handleDelete(card.id);
                                  } else {
                                    handleRemoveCard(section.id!, cardIndex);
                                  }
                                }}
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </span>
                          </div>

                          <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Card Image
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="w-[200px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                                {(() => {
                                  const cardKey = `${section.id}-${card.id ?? `new-${cardIndex}`}`;
                                  const imageSrc =
                                    previewCardImages[cardKey] || card.imageUrl;

                                  return imageSrc ? (
                                    <img
                                      src={imageSrc}
                                      alt="Card preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center text-gray-400 text-xs">
                                      <ImageIcon size={24} className="mb-1" />
                                      <span>No image</span>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div>
                                <label
                                  htmlFor={`bg-${card.id}`}
                                  className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
                                >
                                  <Upload
                                    size={16}
                                    className="text-orange-600"
                                  />
                                  <span>Choose New Image</span>
                                </label>
                                <input
                                  id={`bg-${card.id}`}
                                  hidden
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                      const previewUrl =
                                        URL.createObjectURL(file);

                                      const cardKey = `${section.id}-${card.id ?? `new-${cardIndex}`}`;

                                      setSelectedCardImages((previous) => ({
                                        ...previous,
                                        [cardKey]: file,
                                      }));

                                      setPreviewCardImages((previous) => ({
                                        ...previous,
                                        [cardKey]: previewUrl,
                                      }));
                                    }
                                  }}
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                  Recommended size: 800x500px (PNG, JPG)
                                </p>
                              </div>
                            </div>

                            {/* Card Title */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Card Title
                              </label>

                              <input
                                type="text"
                                value={card.title ?? ""}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    section.id!,
                                    cardIndex,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter card title..."
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            {/* Card Description */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Card Description
                              </label>

                              <textarea
                                value={card.description ?? ""}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    section.id!,
                                    cardIndex,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                placeholder="Enter card description..."
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {section.sectionKey === "Technology" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={section.subtitle ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          section.sectionKey!,
                          "subtitle",
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-orange-500 transition text-sm"
                      placeholder="Enter subtitle..."
                    />

                    {/* Card Management */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-800">
                          Manage Cards
                        </h3>

                        <button
                          type="button"
                          onClick={() => handleAddCard(section.id!)}
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          + Add Card
                        </button>
                      </div>

                      {section.cards.map((card, cardIndex) => (
                        <div
                          key={card.id ?? `new-${section.id}-${cardIndex}`}
                          className="border border-gray-200 rounded-xl p-5 mb-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-700">
                              Technology Card {cardIndex + 1}
                            </h4>

                            <span className="text-xs text-gray-400">
                              <button
                                type="button"
                                onClick={() => {
                                  if (card.id) {
                                    handleDelete(card.id);
                                  } else {
                                    handleRemoveCard(section.id!, cardIndex);
                                  }
                                }}
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </span>
                          </div>

                          <div className="space-y-4">
                            {/* Card Title */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Technology Language
                              </label>

                              <input
                                type="text"
                                value={card.title ?? ""}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    section.id!,
                                    cardIndex,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter card title..."
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            {/* Card Description */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Description
                              </label>

                              <textarea
                                value={card.description ?? ""}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    section.id!,
                                    cardIndex,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                placeholder="Enter card description..."
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Image Upload for Hero Section */}
                {section.sectionKey === "hero" && (
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Section Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-[200px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Section preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div>
                            <ImageIcon size={24} />
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
                            if (file && section.sectionKey) {
                              const previewUrl = URL.createObjectURL(file);
                              setSelectedImages((previous) => ({
                                ...previous,
                                [section.sectionKey!]: file,
                              }));
                              setPreviewImages((previous) => ({
                                ...previous,
                                [section.sectionKey!]: previewUrl,
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
                )}
                {(section.sectionKey === "about call to action" ||
                  section.sectionKey === "contact call to action") && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-gray-800">
                        Manage Cards
                      </h3>

                      <button
                        type="button"
                        onClick={() => handleAddCard(section.id!)}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        + Add Card
                      </button>
                    </div>

                    {section.cards.map((card, cardIndex) => (
                      <div
                        key={card.id ?? `new-${section.id}-${cardIndex}`}
                        className="border border-gray-200 rounded-xl p-5 mb-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">
                            Card {cardIndex + 1}
                          </h4>

                          <span className="text-xs text-gray-400">
                            <button
                              type="button"
                              onClick={() => {
                                if (card.id) {
                                  handleDelete(card.id);
                                } else {
                                  handleRemoveCard(section.id!, cardIndex);
                                }
                              }}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </span>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Card Image
                          </label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-[200px] h-[120px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                              {(() => {
                                const cardKey = `${section.id}-${card.id ?? `new-${cardIndex}`}`;
                                const imageSrc =
                                  previewCardImages[cardKey] || card.imageUrl;

                                return imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt="Card preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center text-gray-400 text-xs">
                                    <ImageIcon size={24} className="mb-1" />
                                    <span>No image</span>
                                  </div>
                                );
                              })()}
                            </div>

                            <div>
                              <label
                                htmlFor={`bg-${card.id}`}
                                className="inline-flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer text-sm transition shadow-sm"
                              >
                                <Upload size={16} className="text-orange-600" />
                                <span>Choose New Image</span>
                              </label>
                              <input
                                id={`bg-${card.id}`}
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];

                                  if (file) {
                                    const previewUrl =
                                      URL.createObjectURL(file);

                                    const cardKey = `${section.id}-${card.id ?? `new-${cardIndex}`}`;

                                    setSelectedCardImages((previous) => ({
                                      ...previous,
                                      [cardKey]: file,
                                    }));

                                    setPreviewCardImages((previous) => ({
                                      ...previous,
                                      [cardKey]: previewUrl,
                                    }));
                                  }
                                }}
                              />
                              <p className="text-xs text-gray-400 mt-2">
                                Recommended size: 800x500px (PNG, JPG)
                              </p>
                            </div>
                          </div>

                          {/* Card Title */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Card Title
                            </label>

                            <input
                              type="text"
                              value={card.title ?? ""}
                              onChange={(e) =>
                                handleCardInputChange(
                                  section.id!,
                                  cardIndex,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter card title..."
                              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* Card Description */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Card Description
                            </label>

                            <textarea
                              value={card.description ?? ""}
                              onChange={(e) =>
                                handleCardInputChange(
                                  section.id!,
                                  cardIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              placeholder="Enter card description..."
                              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
