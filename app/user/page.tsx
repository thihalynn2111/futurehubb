"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", href: "/user/home" },
    { name: "About", href: "/user/about" },
    { name: "Contact", href: "/user/contact" },
    { name: "Gallery", href: "/user/gallery" },
  ];

  return (
    <div>
      <nav className="block w-full max-w-screen-lg px-4 py-3 mx-auto mt-10 bg-white shadow-md rounded-md lg:px-8">
        <div className="container flex flex-wrap items-center justify-between mx-auto text-slate-800">
          {/* Logo */}
          <Link
            href="/user/home"
            className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold"
          >
            FutureHub Myanmar
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <ul className="flex flex-row items-center gap-6">
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center p-1 text-sm text-slate-600"
                >
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto p-2 text-slate-600 hover:text-blue-600 lg:hidden"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="w-full mt-4 lg:hidden">
              <ul className="flex flex-col gap-3 border-t pt-4">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block p-2 text-sm text-slate-600 rounded-md hover:bg-slate-100 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
