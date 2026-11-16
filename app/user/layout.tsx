"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [siteSetting, setSiteSetting] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));

    fetch("/api/admin/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const active = Array.isArray(data)
            ? data.find((s: any) => !s.deletedAt)
            : data;
          if (active) {
            setSiteSetting(active);
            if (active.metaTitle) document.title = active.metaTitle;
            else if (active.siteName) document.title = active.siteName;
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 🚀 အပြင်ဘက် နှိပ်လိုက်ရင် ပိတ်သွားအောင် လုပ်မယ် (Tap/Click နှစ်မျိုးလုံးအတွက်)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const siteName = siteSetting?.siteName || "Future Hub";
  const logoHeader = siteSetting?.logoHeader;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-sans">
      <div>
        {/* ================= NAVBAR SECTION ================= */}
        <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/user/home" className="flex items-center gap-3 group">
              {logoHeader && (
                <img
                  src={logoHeader}
                  alt={siteName}
                  className="h-8 md:h-10 object-contain"
                />
              )}
              <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase group-hover:text-teal-400 transition-colors">
                {siteName}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
              <Link
                href="/user/home"
                className="hover:text-teal-400 transition"
              >
                Home
              </Link>
              <Link
                href="/user/about"
                className="hover:text-teal-400 transition"
              >
                About us
              </Link>
              <Link
                href="/user/gallery"
                className="hover:text-teal-400 transition"
              >
                Gallery
              </Link>

              {/* 🚀 Dropdown Container */}
              <div className="relative py-2" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 hover:text-teal-400 transition cursor-pointer select-none"
                >
                  Products
                  {/* 👇 မြှားလေး ဖွင့်ရင် အပေါ်လှည့်၊ ပိတ်ရင် အောက်လှည့်ဖြစ်အောင် လုပ်ထားတယ် */}
                  <span
                    className={`text-[10px] transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    ▾
                  </span>
                </button>

                {/* 🚀 Dropdown Box (ဖြည်းဖြည်းချင်း ပေါ်လာပြီး ပျောက်သွားအောင် Transition ထည့်ထားတယ်) */}
                <div
                  className={`absolute top-full left-0 w-56 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl py-2 mt-2 space-y-1 z-50 origin-top transition-all duration-200 ease-out ${
                    isDropdownOpen
                      ? "opacity-100 scale-y-100 translate-y-0 visible"
                      : "opacity-0 scale-y-95 -translate-y-2 invisible"
                  }`}
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/user/products/category/${cat.slug}`}
                        onClick={() => setIsDropdownOpen(false)}
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
              </div>

              <Link
                href="/user/project"
                className="hover:text-teal-400 transition"
              >
                Project
              </Link>
              <Link
                href="/user/contact"
                className="hover:text-teal-400 transition"
              >
                Contact
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
    </div>
  );
}
