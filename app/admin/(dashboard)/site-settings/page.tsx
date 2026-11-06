"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function SiteSettingsAdminPage() {
  const [setting, setSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Form States
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [footerText, setFooterText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site-settings");
      if (res.ok) {
        const data = await res.json();
        // Active ဖြစ်သော setting ကို ယူမည်
        const activeSetting = Array.isArray(data)
          ? data.find((s: any) => !s.deletedAt)
          : data;

        if (activeSetting) {
          setSetting(activeSetting);
          setSiteName(activeSetting.siteName || "");
          setSiteTagline(activeSetting.siteTagline || "");
          setContactAddress(activeSetting.contactAddress || "");
          setFooterText(activeSetting.footerText || "");
          setMetaTitle(activeSetting.metaTitle || "");
          setMetaDescription(activeSetting.metaDescription || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch site settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save / Update Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = setting ? "PUT" : "POST";
      const res = await fetch("/api/admin/site-settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: setting?.id,
          siteName,
          siteTagline,
          contactAddress,
          footerText,
          metaTitle,
          metaDescription,
        }),
      });

      if (res.ok) {
        showToast("Site settings saved successfully! ✅");
        fetchSettings();
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Something went wrong.");
    }
  };

  // Soft Delete Handler
  const handleSoftDelete = async (id: number) => {
    if (!confirm("⚠️ Are you sure you want to move site settings to trash?"))
      return;

    const res = await fetch(`/api/admin/site-settings/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showToast("Moved to trash! 🗑️");
      setSetting(null);
      setSiteName("");
      setSiteTagline("");
      setContactAddress("");
      setFooterText("");
      setMetaTitle("");
      setMetaDescription("");
      fetchSettings();
    } else {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading site settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-950">
            Site Settings Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure global website parameters and metadata.
          </p>
        </div>
        <Link
          href="/admin/site-settings/trash"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
        >
          🗑️ View Trash Bin
        </Link>
      </div>

      {/* Active Setting Table Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4">
          Current Active Configuration
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Site Name</th>
                <th className="py-3 px-4">Tagline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {setting ? (
                <tr className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {setting.siteName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {setting.siteTagline || "N/A"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSoftDelete(setting.id)}
                      className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-semibold hover:bg-amber-100 transition cursor-pointer"
                    >
                      🗑️ Trash
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">
                    No active site settings found. Please fill out the form
                    below to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          {setting ? "✏️ Edit Site Settings" : "➕ Create Site Settings"}
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Name:
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="FutureHub"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Tagline:
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                placeholder="Empowering digital innovation"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Address:
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="Yangon, Myanmar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footer Text:
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2026 FutureHub. All rights reserved."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Title:
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="FutureHub Portal"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description:
              </label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Official portfolio and admin management portal"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md transition cursor-pointer"
            >
              💾 Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
