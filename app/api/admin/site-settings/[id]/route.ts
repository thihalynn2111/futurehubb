import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// Auth & Role check helper
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET: Site Setting ရယူရန်
export async function GET() {
  try {
    const setting = await prisma.siteSetting.findFirst();
    return NextResponse.json(setting || {});
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// POST: Site Setting အသစ်ဆောက်ရန် သို့မဟုတ် Update လုပ်ရန်
export async function POST(req: Request) {
  try {
    const isAuth = await verifyAuth();
    if (!isAuth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    let result;
    if (id) {
      // Update existing setting
      result = await prisma.siteSetting.update({
        where: { id: Number(id) },
        data: {
          siteName: data.siteName,
          siteTagline: data.siteTagline,
          contactAddress: data.contactAddress,
          officeHours: data.officeHours,
          footerText: data.footerText,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          logoHeader: data.logoHeader,
          logoHeaderLink: data.logoHeaderLink,
          logoFooter: data.logoFooter,
          logoFooterLink: data.logoFooterLink,
          emails: data.emails || [],
          phones: data.phones || [],
          socialLinks: data.socialLinks || [],
        },
      });
    } else {
      // Create new setting if not exists
      result = await prisma.siteSetting.create({
        data: {
          siteName: data.siteName || "FutureHub",
          siteTagline: data.siteTagline || "",
          contactAddress: data.contactAddress || "",
          officeHours: data.officeHours || "",
          footerText: data.footerText || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          logoHeader: data.logoHeader || "",
          logoHeaderLink: data.logoHeaderLink || "",
          logoFooter: data.logoFooter || "",
          logoFooterLink: data.logoFooterLink || "",
          emails: data.emails || [],
          phones: data.phones || [],
          socialLinks: data.socialLinks || [],
        },
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Save site settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save" },
      { status: 500 },
    );
  }
}

// PUT: POST နှင့်အတူ တူညီစွာ အလုပ်လုပ်စေရန်
export async function PUT(req: Request) {
  return POST(req);
}
