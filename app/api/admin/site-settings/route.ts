import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findFirst();
    return NextResponse.json(setting || {});
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newSetting = await prisma.siteSetting.create({
      data: {
        siteName: body.siteName || "FutureHub",
        siteTagline: body.siteTagline || "",
        contactAddress: body.contactAddress || "",
        footerText: body.footerText || "",
        logoHeader: body.logoHeader || "",
        logoHeaderLink: body.logoHeaderLink || "",
        logoFooter: body.logoFooter || "",
        logoFooterLink: body.logoFooterLink || "",
        emails: body.emails || [],
        phones: body.phones || [],
        socialLinks: body.socialLinks || [], // 👈 Saved here
      },
    });
    return NextResponse.json(newSetting);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      const newSetting = await prisma.siteSetting.create({
        data: {
          siteName: data.siteName || "FutureHub",
          siteTagline: data.siteTagline || "",
          contactAddress: data.contactAddress || "",
          footerText: data.footerText || "",
          logoHeader: data.logoHeader || "",
          logoHeaderLink: data.logoHeaderLink || "",
          logoFooter: data.logoFooter || "",
          logoFooterLink: data.logoFooterLink || "",
          emails: data.emails || [],
          phones: data.phones || [],
          socialLinks: data.socialLinks || [], // 👈 Saved here
        },
      });
      return NextResponse.json(newSetting);
    }

    const updated = await prisma.siteSetting.update({
      where: { id: Number(id) },
      data: {
        siteName: data.siteName,
        siteTagline: data.siteTagline,
        contactAddress: data.contactAddress,
        footerText: data.footerText,
        logoHeader: data.logoHeader,
        logoHeaderLink: data.logoHeaderLink,
        logoFooter: data.logoFooter,
        logoFooterLink: data.logoFooterLink,
        emails: data.emails || [],
        phones: data.phones || [],
        socialLinks: data.socialLinks || [], // 👈 Updated here
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
