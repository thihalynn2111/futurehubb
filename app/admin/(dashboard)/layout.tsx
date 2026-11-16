"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// 🚀 ပိုမိုသပ်ရပ်သော Sidebar Component
function SidebarNav({ sidebarOpen }: { sidebarOpen: boolean }) {
  const pathname = usePathname();

  // Category အားလုံးကို Default အနေနဲ့ ဖွင့်ထားမယ်
  const [openCategories, setOpenCategories] = useState<string[]>([
    "ACCESS & MANAGEMENT",
    "CUSTOMER & COMMUNICATION",
    "CONTENT & CATALOGUE",
  ]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  // 🚀 Menu တွေကို သီးသန့် Group တွေ ခွဲထားပါတယ် (SEO Settings ပါဝင်ပါတယ်)
  const menuGroups = [
    {
      category: "",
      items: [{ name: "Dashboard Overview", href: "/admin", icon: "📊" }],
    },
    {
      category: "ACCESS & MANAGEMENT",
      items: [
        { name: "Roles Management", href: "/admin/roles", icon: "🛡️" },
        { name: "Permissions", href: "/admin/permissions", icon: "🔑" },
        { name: "User Management", href: "/admin/users", icon: "👤" },
      ],
    },
    {
      category: "COMMUNICATION",
      items: [{ name: "Inquiries", href: "/admin/inquiries", icon: "📩" }],
    },
    {
      category: "CONTENT & CATALOGUE",
      items: [
        { name: "Products", href: "/admin/products", icon: "📦" },
        { name: "SEO Settings", href: "/admin/seo", icon: "🔍" }, // 👈 ဒီနေရာမှာ ထည့်ထားပါတယ်
        { name: "Gallery", href: "/admin/gallery", icon: "📷" },
        { name: "Partner & Project", href: "/admin/projects", icon: "🤝" },
        { name: "Team member", href: "/admin/teamMember", icon: "👥" },
        { name: "Site Settings", href: "/admin/site-settings", icon: "⚙️" },
        {
          name: "Home Content",
          href: "/admin/page-sections/homeSection",
          icon: "🏠",
        },
        {
          name: "About Content",
          href: "/admin/page-sections/aboutSection",
          icon: "📄",
        },
        {
          name: "Contact Content",
          href: "/admin/page-sections/contactSection",
          icon: "📩",
        },
        {
          name: "Gallery Content",
          href: "/admin/page-sections/gallerySection",
          icon: "🖼️",
        },
        {
          name: "Partner & Project Content",
          href: "/admin/page-sections/projectSection",
          icon: "🤝",
        },
      ],
    },
  ];

  return (
    <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
      {menuGroups.map((group, groupIdx) => {
        const isOpen = openCategories.includes(group.category);
        const hasCategory = group.category !== "";

        return (
          <div key={groupIdx} className="space-y-1">
            {/* 🚀 Category Header (Accordion Toggle) */}
            {hasCategory && sidebarOpen && (
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center justify-between px-3 py-2 mt-4 mb-1 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group"
              >
                <span>{group.category}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            )}

            {/* 🚀 Sub Items (Smooth Accordion Animation) */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                hasCategory && !isOpen && sidebarOpen
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="overflow-hidden space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!sidebarOpen ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-slate-800 text-teal-400 shadow-sm border-l-2 border-teal-400"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent"
                      }`}
                    >
                      <span
                        className={`text-base shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "opacity-100" : "opacity-70"}`}
                      >
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex text-gray-900 font-sans">
      {/* 1. SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-[260px]" : "w-20"
        } bg-[#0f172a] text-white transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl border-r border-slate-800/50`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50 shrink-0">
          {sidebarOpen ? (
            <span className="font-extrabold text-xl tracking-wide text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-slate-900 font-black text-lg">
                F
              </div>
              FutureHub<span className="text-teal-400 font-normal">Admin</span>
            </span>
          ) : (
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-slate-900 font-black text-lg mx-auto">
              F
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Sidebar Menu */}
        <Suspense
          fallback={
            <div className="p-4 text-xs text-slate-500">Loading...</div>
          }
        >
          <SidebarNav sidebarOpen={sidebarOpen} />
        </Suspense>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-800/50 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">
            A
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                System Admin
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                system@futurehub.com
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-[260px]" : "ml-20"
        }`}
      >
        {/* TOP NAVBAR (Frosted Glass Effect) */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              Admin Management Portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/user/home"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-600 text-sm font-semibold px-4 py-2 rounded-xl border border-teal-200/50 transition-all duration-200 cursor-pointer hover:shadow-sm"
            >
              🌐 View Live Site
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer hover:shadow-sm"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
