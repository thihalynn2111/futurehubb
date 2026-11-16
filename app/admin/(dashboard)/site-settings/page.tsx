"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SiteSettingsAdminPage() {
  const router = useRouter();
  const [setting, setSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [canRead, setCanRead] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [footerText, setFooterText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [logoHeader, setLogoHeader] = useState("");
  const [logoFooter, setLogoFooter] = useState("");

  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);

  const [emails, setEmails] = useState<string[]>([""]);
  const [phones, setPhones] = useState<string[]>([""]);
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string; icon: string }[]
  >([{ platform: "Facebook", url: "", icon: "" }]);

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

        const isSuper = roles.some(
          (r: string) =>
            r.toLowerCase() === "super_admin" ||
            r.toLowerCase() === "super-admin" ||
            r.toLowerCase() === "admin" ||
            r.toLowerCase() === "system",
        );

        const lowerPerms = permissions.map((p: string) => p.toLowerCase());

        const hasRead =
          isSuper ||
          lowerPerms.includes("site_settings:read") ||
          lowerPerms.includes("site-settings:read") ||
          lowerPerms.includes("site_settings:*") ||
          lowerPerms.includes("read") ||
          lowerPerms.includes("*");

        const hasUpdate =
          isSuper ||
          lowerPerms.includes("site_settings:update") ||
          lowerPerms.includes("site-settings:update") ||
          lowerPerms.includes("site_settings:*") ||
          lowerPerms.includes("update") ||
          lowerPerms.includes("*");

        if (!hasRead) {
          alert(
            "Access Denied: You do not have permission to view site settings.",
          );
          router.replace("/admin");
          return;
        }

        setCanRead(true);
        setCanUpdate(hasUpdate);
        fetchSettings();
      } else {
        router.replace("/admin/login");
      }
    } catch (err) {
      console.error("Permission check error:", err);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site-settings");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSetting(data);
          setSiteName(data.siteName || "");
          setSiteTagline(data.siteTagline || "");
          setContactAddress(data.contactAddress || "");
          setOfficeHours(data.officeHours || "");
          setFooterText(data.footerText || "");
          setMetaTitle(data.metaTitle || "");
          setMetaDescription(data.metaDescription || "");
          setLogoHeader(data.logoHeader || "");
          setLogoFooter(data.logoFooter || "");

          if (Array.isArray(data.emails) && data.emails.length > 0)
            setEmails(data.emails);
          if (Array.isArray(data.phones) && data.phones.length > 0)
            setPhones(data.phones);
          if (Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
            setSocialLinks(data.socialLinks);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
    setUploading: (status: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
        showToast("Image uploaded successfully! ✅");
      } else {
        alert("Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddField = (type: "email" | "phone") => {
    if (!canUpdate) return;
    if (type === "email") setEmails([...emails, ""]);
    if (type === "phone") setPhones([...phones, ""]);
  };

  const handleRemoveField = (type: "email" | "phone", index: number) => {
    if (!canUpdate) return;
    if (type === "email") {
      const updated = emails.filter((_, i) => i !== index);
      setEmails(updated.length ? updated : [""]);
    } else {
      const updated = phones.filter((_, i) => i !== index);
      setPhones(updated.length ? updated : [""]);
    }
  };

  const handleFieldChange = (
    type: "email" | "phone",
    index: number,
    value: string,
  ) => {
    if (!canUpdate) return;
    if (type === "email") {
      const updated = [...emails];
      updated[index] = value;
      setEmails(updated);
    } else {
      const updated = [...phones];
      updated[index] = value;
      setPhones(updated);
    }
  };

  const handleAddSocial = () => {
    if (!canUpdate) return;
    setSocialLinks([...socialLinks, { platform: "", url: "", icon: "" }]);
  };

  const handleRemoveSocial = (index: number) => {
    if (!canUpdate) return;
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(
      updated.length ? updated : [{ platform: "", url: "", icon: "" }],
    );
  };

  const handleSocialChange = (
    index: number,
    field: "platform" | "url" | "icon",
    value: string,
  ) => {
    if (!canUpdate) return;
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) {
      alert("You do not have permission to update settings.");
      return;
    }

    try {
      const method = setting?.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/site-settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: setting?.id,
          siteName,
          siteTagline,
          contactAddress,
          officeHours,
          footerText,
          metaTitle,
          metaDescription,
          logoHeader,
          logoFooter,
          emails: emails.filter((e) => e.trim() !== ""),
          phones: phones.filter((p) => p.trim() !== ""),
          socialLinks: socialLinks.filter(
            (s) => s.platform.trim() !== "" && s.url.trim() !== "",
          ),
        }),
      });

      if (res.ok) {
        showToast("Site settings updated successfully! ✅");
        fetchSettings();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-500">
        Loading site settings...
      </div>
    );
  if (!canRead) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Site Settings & Branding Configuration
            {!canUpdate && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                🔒 Read-Only (Update Locked)
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage branding, SEO, contacts, and social links.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
      >
        {/* Site Name & Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Site Name (Required):
            </label>
            <input
              type="text"
              required
              disabled={!canUpdate}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Site Tagline:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              placeholder="Your Tech Partner"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* 👇 Logos (File Upload & Image Preview ပါဝင်လာပြီ) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Header Logo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Header Logo URL:
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  disabled={!canUpdate}
                  value={logoHeader}
                  onChange={(e) => setLogoHeader(e.target.value)}
                  placeholder="/uploads/logo.png"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {/* 🚀 လက်ရှိ Logo ပုံလေး ပြပေးမယ် */}
                {logoHeader && (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={logoHeader}
                      alt="Header Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
              </div>
              {canUpdate && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, setLogoHeader, setUploadingHeader)
                    }
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingHeader && (
                    <span className="text-xs text-blue-600">Uploading...</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Logo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Footer Logo URL:
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  disabled={!canUpdate}
                  value={logoFooter}
                  onChange={(e) => setLogoFooter(e.target.value)}
                  placeholder="/uploads/logo-footer.png"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {/* 🚀 လက်ရှိ Footer Logo ပုံလေး ပြပေးမယ် */}
                {logoFooter && (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={logoFooter}
                      alt="Footer Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
              </div>
              {canUpdate && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, setLogoFooter, setUploadingFooter)
                    }
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingFooter && (
                    <span className="text-xs text-blue-600">Uploading...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 👆 Logo အပိုင်း ပြီးပါပြီ */}

        {/* Contact Address & Office Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Address:
            </label>
            <textarea
              rows={2}
              disabled={!canUpdate}
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office Hours:
            </label>
            <textarea
              rows={2}
              disabled={!canUpdate}
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              placeholder="9:00 AM - 5:30 PM (Mon to Fri)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Emails */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">
              Emails:
            </label>
            {canUpdate && (
              <button
                type="button"
                onClick={() => handleAddField("email")}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Add Email
              </button>
            )}
          </div>
          {emails.map((email, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="email"
                disabled={!canUpdate}
                value={email}
                onChange={(e) =>
                  handleFieldChange("email", idx, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => handleRemoveField("email", idx)}
                  className="px-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold"
                >
                  ✕ Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Phones */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">
              Phone Numbers:
            </label>
            {canUpdate && (
              <button
                type="button"
                onClick={() => handleAddField("phone")}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Add Phone
              </button>
            )}
          </div>
          {phones.map((phone, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                disabled={!canUpdate}
                value={phone}
                onChange={(e) =>
                  handleFieldChange("phone", idx, e.target.value)
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => handleRemoveField("phone", idx)}
                  className="px-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold"
                >
                  ✕ Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800">
              🌐 Social Media Links & Logos:
            </label>
            {canUpdate && (
              <button
                type="button"
                onClick={handleAddSocial}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Add Social Link
              </button>
            )}
          </div>
          {socialLinks.map((social, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-200"
            >
              <input
                type="text"
                disabled={!canUpdate}
                value={social.platform}
                onChange={(e) =>
                  handleSocialChange(idx, "platform", e.target.value)
                }
                placeholder="Platform (Facebook)"
                className="w-1/4 px-3 py-1.5 border rounded-md text-xs text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                disabled={!canUpdate}
                value={social.url}
                onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                placeholder="Profile URL (https://...)"
                className="flex-1 px-3 py-1.5 border rounded-md text-xs text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                disabled={!canUpdate}
                value={social.icon}
                onChange={(e) =>
                  handleSocialChange(idx, "icon", e.target.value)
                }
                placeholder="Logo/Icon Image URL"
                className="w-1/3 px-3 py-1.5 border rounded-md text-xs text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => handleRemoveSocial(idx)}
                  className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* SEO Meta Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Global SEO Meta Title:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="FutureHub Myanmar"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Global SEO Meta Description:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Leading web development services..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer Copyright Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Footer Copyright Text:
          </label>
          <input
            type="text"
            disabled={!canUpdate}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* 💾 Save Button */}
        {canUpdate && (
          <div className="pt-4 text-right">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow cursor-pointer"
            >
              💾 Save All Settings
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
