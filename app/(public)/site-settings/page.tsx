import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  try {
    const setting = await prisma.siteSetting.findFirst();

    return {
      title: setting?.metaTitle || setting?.siteName || "FutureHub",
      description:
        setting?.metaDescription ||
        setting?.siteTagline ||
        "Default description",
    };
  } catch {
    return {
      title: "FutureHub",
      description: "Admin & Web Portal",
    };
  }
}

export default async function PublicSiteSettingsPage() {
  await connection();
  const setting = await prisma.siteSetting.findFirst();

  if (!setting) {
    return (
      <div className="max-w-4xl mx-auto p-16 text-center text-slate-500 font-medium">
        No site settings found. Please configure them in the admin dashboard.
      </div>
    );
  }

  const emails = (setting.emails as string[]) || [];
  const phones = (setting.phones as string[]) || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute w-64 h-64 bg-blue-600/20 rounded-full blur-2xl -top-10 -right-10 pointer-events-none"></div>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
            System Configuration
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {setting.siteName}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal">
            {setting.siteTagline || "Welcome to our official portal platform."}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              📍 Contact Details
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Address
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {setting.contactAddress || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Emails
                </p>
                {emails.length > 0 ? (
                  emails.map((email, idx) => (
                    <p key={idx} className="font-medium text-slate-800 mt-0.5">
                      {email}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No emails listed</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Phones
                </p>
                {phones.length > 0 ? (
                  phones.map((phone, idx) => (
                    <p key={idx} className="font-medium text-slate-800 mt-0.5">
                      {phone}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No phones listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer & Meta Info */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              ⚙️ Metadata & Footer
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Meta Title
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {setting.metaTitle || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Meta Description
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {setting.metaDescription || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Footer Text
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {setting.footerText || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
