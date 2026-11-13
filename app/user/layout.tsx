"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [siteSetting, setSiteSetting] = useState<any>(null);

  useEffect(() => {
    // 1. Categories များကို ဆွဲထုတ်ခြင်း
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));

    // 2. Site Settings ကို ဆွဲထုတ်ပြီး Title နဲ့ Meta Description များကို တိုက်ရိုက်ချိတ်ပေးခြင်း
    fetch("/api/admin/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const active = Array.isArray(data)
            ? data.find((s: any) => !s.deletedAt)
            : data;
          if (active) {
            setSiteSetting(active);

            // Dynamic Browser Tab Title
            if (active.metaTitle) {
              document.title = active.metaTitle;
            } else if (active.siteName) {
              document.title = active.siteName;
            }

            // Dynamic Meta Description for SEO
            if (active.metaDescription) {
              let metaDesc = document.querySelector("meta[name='description']");
              if (!metaDesc) {
                metaDesc = document.createElement("meta");
                metaDesc.setAttribute("name", "description");
                document.head.appendChild(metaDesc);
              }
              metaDesc.setAttribute("content", active.metaDescription);
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Settings Values & Fallbacks
  const siteName = siteSetting?.siteName || "FutureHub";
  const logoHeader = siteSetting?.logoHeader;
  const logoFooter = siteSetting?.logoFooter;
  const contactAddress =
    siteSetting?.contactAddress || "No.839, Kyaw Thu 23 Street, Yangon";
  const officeHours =
    siteSetting?.officeHours || "9:00 AM - 5:30 PM (Mon to Fri)";

  const emails =
    Array.isArray(siteSetting?.emails) && siteSetting?.emails.length > 0
      ? siteSetting.emails
      : ["sale@futurehubmyanmar.com"];
  const phones =
    Array.isArray(siteSetting?.phones) && siteSetting?.phones.length > 0
      ? siteSetting.phones
      : ["+95 9 950 502 777"];
  const socialLinks = Array.isArray(siteSetting?.socialLinks)
    ? siteSetting.socialLinks
    : [];
  const footerText =
    siteSetting?.footerText ||
    "Copyright © 2026 Future Hub Myanmar Co.,Ltd. All Rights Reserved.";

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("facebook")) return "f";
    if (p.includes("tiktok")) return "Tk";
    if (p.includes("youtube")) return "▶";
    if (p.includes("instagram")) return "ig";
    if (p.includes("linkedin")) return "in";
    return "🌐";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-sans">
      <div>
        {/* ================= NAVBAR SECTION ================= */}
        <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link
              href="/products"
              className="text-xl font-bold tracking-wider text-teal-400 flex items-center gap-3"
            >
              {logoHeader ? (
                <img
                  src={logoHeader}
                  alt={siteName}
                  className="h-8 object-contain"
                />
              ) : (
                <span>⬛ {siteName}</span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
              <Link
                href="/user/home"
                className="hover:text-teal-400 transition"
              >
                Home
              </Link>

              <div
                className="relative group py-2"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center gap-1 hover:text-teal-400 transition cursor-pointer">
                  Product category ▾
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 mt-1 space-y-1 z-50">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        // 👇 ဒီနေရာမှာ cat.id အစား cat.slug ကို ပြောင်းထားပါတယ် 👇
                        <Link
                          key={cat.id}
                          href={`/user/products/category/${cat.slug}`}
                          className="block px-4 py-2.5 text-sm hover:bg-teal-500/20 hover:text-teal-300 transition truncate"
                        >
                          📂 {cat.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2.5 text-xs text-slate-400 italic">
                        No categories found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/user/project"
                className="hover:text-teal-400 transition"
              >
                Project
              </Link>
              <Link
                href="/user/about"
                className="hover:text-teal-400 transition"
              >
                About us
              </Link>
              <Link
                href="/user/contact"
                className="hover:text-teal-400 transition"
              >
                Contact
              </Link>
              <Link
                href="/user/gallery"
                className="hover:text-teal-400 transition"
              >
                Gallery
              </Link>
            </div>

            <Link
              href="/user/contact"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-full transition shadow-lg text-sm"
            >
              Let's Talk ↗
            </Link>
          </div>
        </nav>

        {/* ================= MAIN CONTENT ================= */}
        <main>{children}</main>
      </div>

      {/* ================= FOOTER SECTION ================= */}
      <footer className="bg-[#0b4f58] text-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* Contact Details */}
            <div className="space-y-3 text-sm leading-relaxed">
              {logoFooter && (
                <div className="mb-4">
                  <Link href="/products">
                    <img
                      src={logoFooter}
                      alt="Footer Logo"
                      className="h-10 object-contain cursor-pointer"
                    />
                  </Link>
                </div>
              )}
              <p>
                <strong className="font-semibold text-white">Address:</strong>{" "}
                {contactAddress}
              </p>
              <p>
                <strong className="font-semibold text-white">Email:</strong>{" "}
                {emails.join(" | ")}
              </p>
              <p>
                <strong className="font-semibold text-white">Phone:</strong>{" "}
                {phones.join(" | ")}
              </p>
              <p>
                <strong className="font-semibold text-white">
                  Office Hours:
                </strong>{" "}
                {officeHours}
              </p>
            </div>

            {/* Social Media Links & Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((social: any, idx: number) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl border border-cyan-400/40 flex items-center justify-center hover:bg-cyan-500/10 transition text-white font-bold text-base bg-white/5"
                    title={social.platform}
                  >
                    {social.icon ? (
                      <img
                        src={social.icon}
                        alt={social.platform}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      getSocialIcon(social.platform)
                    )}
                  </a>
                ))
              ) : (
                <div className="text-xs text-cyan-200/60 italic">
                  No social links
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-cyan-900/50 py-6 text-center text-xs text-slate-300">
          <p>{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
