"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 👈 ထည့်ပါ

const staticPages = [
  { pageName: "home", label: "Home Page" },
  { pageName: "about", label: "About Us" },
  { pageName: "contact", label: "Contact Us" },
  { pageName: "gallery", label: "Gallery" },
  { pageName: "project", label: "Projects" },
];

export default function SeoManagementPage() {
  const router = useRouter();
  const [seoPages, setSeoPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // 🚀 Permission States
  const [canRead, setCanRead] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);

  // Form States
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const checkPermissions = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userInfo = data.user || {};
        const roles = userInfo.roles || [];
        const permissions = userInfo.permissions || [];

        const isSuper = roles.some((r: string) =>
          ["super_admin", "super-admin", "admin", "system"].includes(
            r.toLowerCase(),
          ),
        );

        const lowerPerms = permissions.map((p: string) => p.toLowerCase());

        const hasRead =
          isSuper ||
          lowerPerms.includes("seo:read") ||
          lowerPerms.includes("*");
        const hasUpdate =
          isSuper ||
          lowerPerms.includes("seo:update") ||
          lowerPerms.includes("*");

        setCanRead(hasRead);
        setCanUpdate(hasUpdate);

        if (hasRead) {
          fetchSeoData();
        } else {
          alert(
            "Access Denied: You do not have permission to view SEO settings.",
          );
          router.replace("/admin");
        }
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  const fetchSeoData = async () => {
    try {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      if (Array.isArray(data)) setSeoPages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleEditClick = (pageName: string) => {
    setEditingPage(pageName);
    const existing = seoPages.find((p) => p.pageName === pageName);

    if (existing) {
      setMetaTitle(existing.metaTitle || "");
      setMetaDesc(existing.metaDesc || "");
      setKeywords(existing.keywords || "");
    } else {
      setMetaTitle("");
      setMetaDesc("");
      setKeywords("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !canUpdate) return;

    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageName: editingPage,
          metaTitle,
          metaDesc,
          keywords,
        }),
      });

      if (res.ok) {
        showToast("SEO Settings Saved! ✅");
        setEditingPage(null);
        fetchSeoData();
      } else {
        alert("Failed to save SEO");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">
        Checking permissions...
      </div>
    );
  if (!canRead) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 p-4 md:p-8">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            🔍 SEO Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage Meta Titles and Descriptions for static pages.
          </p>
        </div>
        {!canUpdate && (
          <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
            🔒 Read-Only
          </span>
        )}
      </div>

      {/* EDIT FORM */}
      {editingPage && canUpdate && (
        <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-blue-100 pb-3">
            <h2 className="text-lg font-bold text-blue-900">
              ✏️ Edit SEO for:{" "}
              <span className="uppercase">
                {staticPages.find((p) => p.pageName === editingPage)?.label}
              </span>
            </h2>
            <button
              onClick={() => setEditingPage(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-500 transition cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. About Us - FutureHub Myanmar"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Short description for Google Search..."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Keywords (Optional)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="web development, software, myanmar"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
              >
                💾 Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            Static Pages SEO List
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Page</th>
                <th className="p-4 font-semibold w-1/3">Meta Title</th>
                <th className="p-4 font-semibold w-1/3">Meta Description</th>
                {canUpdate && (
                  <th className="p-4 font-semibold text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {staticPages.map((page) => {
                const dbData = seoPages.find(
                  (p) => p.pageName === page.pageName,
                );

                return (
                  <tr
                    key={page.pageName}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900">
                      {page.label}
                    </td>
                    <td className="p-4 text-slate-600">
                      {dbData?.metaTitle ? (
                        <span className="line-clamp-1">{dbData.metaTitle}</span>
                      ) : (
                        <span className="text-amber-500 italic text-xs">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {dbData?.metaDesc ? (
                        <span className="line-clamp-1">{dbData.metaDesc}</span>
                      ) : (
                        <span className="text-amber-500 italic text-xs">
                          Not set
                        </span>
                      )}
                    </td>
                    {canUpdate && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditClick(page.pageName)}
                          className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
