"use client";

import React, { useState, useEffect } from "react";

export default function SiteSettingsAdminPage() {
  const [setting, setSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [canUpdate, setCanUpdate] = useState(false); // 👈 Default အနေဖြင့် ပိတ်ထားမည် (Permission ရှိမှ True ဖြစ်မည်)

  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [footerText, setFooterText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [logoHeader, setLogoHeader] = useState("");
  const [logoFooter, setLogoFooter] = useState("");

  const [emails, setEmails] = useState<string[]>([""]);
  const [phones, setPhones] = useState<string[]>([""]);
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string; icon: string }[]
  >([{ platform: "Facebook", url: "", icon: "" }]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 🔍 User တွင် Update Permission ရှိမရှိ စစ်ဆေးခြင်း
  const checkPermissions = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userInfo = data.user || {};
        const roles = userInfo.roles || [];
        const permissions = userInfo.permissions || [];

        // ၁။ System Admin / Super Admin ဖြစ်ပါက အမြဲတမ်း ခွင့်ပြုမည်
        const isSuper = roles.some(
          (r: string) =>
            r.toLowerCase() === "super_admin" ||
            r.toLowerCase() === "super-admin" ||
            r.toLowerCase() === "admin" ||
            r.toLowerCase() === "system",
        );

        if (isSuper) {
          setCanUpdate(true);
          return;
        }

        // ၂။ သာမန် User/Author များအတွက် Update Permission ရှိမရှိ စစ်ဆေးမည်
        const hasUpdatePerm =
          permissions.includes("site_settings:update") ||
          permissions.includes("site-settings:update") ||
          permissions.includes("update") ||
          permissions.includes("site_settings:*");

        setCanUpdate(hasUpdatePerm); // Permission ရှိမှသာ true ဖြစ်မည်၊ မရှိရင် false ဖြစ်ပြီး ခလုတ်ပျောက်မည်
      } else {
        setCanUpdate(false);
      }
    } catch (err) {
      console.error("Permission check error:", err);
      setCanUpdate(false);
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
    fetchSettings();
  }, []);

  const handleAddField = (type: "email" | "phone") => {
    if (type === "email") setEmails([...emails, ""]);
    if (type === "phone") setPhones([...phones, ""]);
  };

  const handleRemoveField = (type: "email" | "phone", index: number) => {
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
    setSocialLinks([...socialLinks, { platform: "", url: "", icon: "" }]);
  };

  const handleRemoveSocial = (index: number) => {
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
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Site Settings & Branding Configuration
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Header Logo URL:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={logoHeader}
              onChange={(e) => setLogoHeader(e.target.value)}
              placeholder="/images/logo.png"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Footer Logo URL:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={logoFooter}
              onChange={(e) => setLogoFooter(e.target.value)}
              placeholder="/images/logo-footer.png"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
            />
          </div>
        </div>

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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
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
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
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
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
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
                className="w-1/4 px-3 py-1.5 border rounded-md text-xs text-slate-900 disabled:bg-slate-100"
              />
              <input
                type="text"
                disabled={!canUpdate}
                value={social.url}
                onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                placeholder="Profile URL (https://...)"
                className="flex-1 px-3 py-1.5 border rounded-md text-xs text-slate-900 disabled:bg-slate-100"
              />
              <input
                type="text"
                disabled={!canUpdate}
                value={social.icon}
                onChange={(e) =>
                  handleSocialChange(idx, "icon", e.target.value)
                }
                placeholder="Logo/Icon Image URL"
                className="w-1/3 px-3 py-1.5 border rounded-md text-xs text-slate-900 disabled:bg-slate-100"
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
              SEO Meta Title:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="FutureHub Myanmar"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SEO Meta Description:
            </label>
            <input
              type="text"
              disabled={!canUpdate}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Leading web development services..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none disabled:bg-slate-100"
          />
        </div>

        {/* 💾 Save Button - (Update Permission ရှိသော Super Admin / User များအတွက်သာ ပေါ်မည်) */}
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
