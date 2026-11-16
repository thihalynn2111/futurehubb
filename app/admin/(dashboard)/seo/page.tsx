"use client";

import React, { useState, useEffect } from "react";

export default function SeoManagementPage() {
  const [seoPages, setSeoPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Form States
  const [pageName, setPageName] = useState("home");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
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
    fetchSeoData();
  }, []);

  // Dropdown ပြောင်းတဲ့အခါ သက်ဆိုင်ရာ Data တွေ ပြန်ဖြည့်မယ်
  useEffect(() => {
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
  }, [pageName, seoPages]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageName, metaTitle, metaDesc, keywords }),
      });

      if (res.ok) {
        showToast("SEO Settings Saved! ✅");
        fetchSeoData();
      } else {
        alert("Failed to save SEO");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading SEO data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 p-4 md:p-8">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl font-semibold z-50">
          {toast}
        </div>
      )}

      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">🔍 SEO Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage Meta Titles and Descriptions for static pages.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Select Page
            </label>
            <select
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium cursor-pointer"
            >
              <option value="home">Home Page</option>
              <option value="about">About Us</option>
              <option value="contact">Contact Us</option>
              <option value="gallery">Gallery</option>
              <option value="project">Projects</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
              Meta Title
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="e.g. About Us - FutureHub Myanmar"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer"
          >
            💾 Save SEO Settings
          </button>
        </form>
      </div>
    </div>
  );
}
