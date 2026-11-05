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

  useEffect(() => {
    // ⚠️ Product တွေအစား Category များကိုသာ API ကနေ ဆွဲထုတ်မည်
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Categories for Navbar:", data);
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ⬛ Modern Dark Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/products"
            className="text-xl font-bold tracking-wider text-teal-400 flex items-center gap-2"
          >
            ⬛ FutureHub
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
            <Link href="/products" className="hover:text-teal-400 transition">
              Products
            </Link>

            {/* Category Dropdown Menu */}
            <div
              className="relative group py-2"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-teal-400 transition focus:outline-none">
                Catalog ▾
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 mt-1 space-y-1 z-50">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?categoryId=${cat.id}`}
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

            <Link href="/contact" className="hover:text-teal-400 transition">
              Contact
            </Link>
          </div>

          <Link
            href="/contact"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-full transition shadow-lg text-sm"
          >
            Let's Talk ↗
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>{children}</main>
    </div>
  );
}
