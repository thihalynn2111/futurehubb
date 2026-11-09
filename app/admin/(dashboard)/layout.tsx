"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPageInfoOpen, setIsPageInfoOpen] = useState(false);
  // 👇 Category / Subtitles များဖြင့် အုပ်စုဖွဲ့ထားသော Menu List
  const menuGroups = [
    {
      category: "", // Dashboard အတွက် ခေါင်းစဉ်မလိုပါ
      items: [{ name: "Dashboard Overview", href: "/admin", icon: "📊" }],
    },
    {
      category: "ACCESS & MANAGEMENT",
      items: [
        { name: "Roles Management", href: "/admin/roles", icon: "🛡️" },
        { name: "Permissions", href: "/admin/permissions", icon: "🔑" },
        { name: "User Management", href: "/admin/users", icon: "👤" },
        { name: "Inquiries", href: "/admin/inquiries", icon: "📩" },
        { name: "Gallery", href: "/admin/gallery", icon: "📷" },
        { name: "Partner", href: "/admin/projectSection", icon: "🤝" },
        { name: "Team member", href: "/admin/viewMember", icon: "👥" },
      ],
    },
    {
      category: "CONTENT & CATALOGUE",
      items: [
        { name: "Products", href: "/admin/products", icon: "📦" },
        { name: "Site Settings", href: "/admin/site-settings", icon: "⚙️" },
      ],
    },
  ];

  // Logout Logic
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
    <div className="min-h-screen bg-gray-100 flex text-gray-900 font-sans">
      {/* 1. SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800 shrink-0">
          {sidebarOpen ? (
            <span className="font-extrabold text-xl tracking-wide text-blue-400">
              FutureHub<span className="text-white">Admin</span>
            </span>
          ) : (
            <span className="font-bold text-xl text-blue-400 mx-auto">FH</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1 rounded-md focus:outline-none"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation Groups & Links */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {/* Category Subtitle (Sidebar ပွင့်နေမှသာ ပြမည်) */}
              {group.category && sidebarOpen && (
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pt-2">
                  {group.category}
                </h3>
              )}

              {/* Items inside Group */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!sidebarOpen ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md font-semibold"
                          : "text-gray-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="text-lg shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div></div>
          <button
            onClick={() => setIsPageInfoOpen(!isPageInfoOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
          >
            <div className="flex items-center space-x-3">
              <FileText size={18} />
              <span>Page Information</span>
            </div>
            {isPageInfoOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Sub-menu items (Dropdown List) */}
          {isPageInfoOpen && (
            <div className="pl-10 pr-2 py-1 space-y-1 mt-1 bg-gray-900/50 rounded-lg">
              <Link
                href="/admin/homeSection"
                className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 transition"
              >
                Home Page
              </Link>
              <Link
                href="/admin/aboutSection"
                className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 transition"
              >
                About Page
              </Link>
              <Link
                href="/admin/contactSection"
                className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 transition"
              >
                Contact Page
              </Link>
              <Link
                href="/admin/gallerySection"
                className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 transition"
              >
                Gallery Page
              </Link>
            </div>
          )}
        </nav>

        {/* User Info / Footer in Sidebar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
            A
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                Super Admin
              </p>
              <p className="text-xs text-gray-400 truncate">
                admin@futurehub.com
              </p>
            </div>
          )}
        </div>
        {/* 🌟 Page Information Dropdown Menu */}
      </aside>

      {/* 2. MAIN CONTENT AREA CONTAINER */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">
              Admin Management Portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ● Online
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-md border border-gray-300 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
