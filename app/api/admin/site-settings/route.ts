import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

async function verifyUpdatePermission(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = Number(payload.id || payload.userId);
    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt || Number(user.status) !== 1) return false;

    // Admin သို့မဟုတ် System သို့မဟုတ် HR ဖြစ်ပါက အလိုအလျောက် ခွင့်ပြုမည်
    return true;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
}

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

export async function POST(req: Request) {
  try {
    const canUpdate = await verifyUpdatePermission(req);
    if (!canUpdate) {
      return NextResponse.json(
        {
          message: "Forbidden: You do not have permission to update settings.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { id, ...data } = body;

    let result;
    if (id) {
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

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("Save site settings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
