"use client";

import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  // FutureHub Admin Panel အတွက် Card စာရင်းများ
  const dashboardCards = [
    {
      title: "Product Category",
      description: "Manage product categories, lists and inventory items.",
      href: "/admin/products",
      icon: "📦",
    },
    {
      title: "Gallery",
      description: "Curate the project and product showcase gallery.",
      href: "/admin/projects", // သို့မဟုတ် /admin/gallery
      icon: "🖼️",
    },
    {
      title: "Partner Carousel",
      description: "Update the partner logo carousel and brand sliders.",
      href: "/admin/team", // သို့မဟုတ် သက်ဆိုင်ရာ route
      icon: "🤝",
    },
    {
      title: "Contact Requests",
      description: "Review inquiries and messages submitted by customers.",
      href: "/admin/inquiries",
      icon: "✉️",
    },
    {
      title: "Offices",
      description: "Maintain office locations, branches and contact details.",
      href: "/admin/seo", // သို့မဟုတ် သက်ဆိုင်ရာ route
      icon: "🏢",
    },
    {
      title: "Basic Settings",
      description: "Company contact info, social links and footer settings.",
      href: "/admin/site-settings",
      icon: "⚙️",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. GRID CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
            <div className="mt-6 flex items-center text-blue-600 font-bold text-sm tracking-wide">
              <span>OPEN</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 2. BOTTOM FULL-WIDTH CARD (Page Information) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            📄
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Page information
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Edit hero content, section copy and imagery for each public page.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Home",
                "About Us",
                "Contact Us",
                "Product Category",
                "Gallery",
              ].map((pageName, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
                >
                  {pageName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
