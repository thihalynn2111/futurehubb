import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// 🚀 Permission စစ်ဆေးပေးမယ့် Helper Function
async function verifyPermission(req: Request, requiredPermission: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = Number(payload.userId || payload.id);
    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt || Number(user.status) !== 1) return false;

    const isSuper = user.userRoles.some((ur: any) =>
      ["SUPER_ADMIN", "SUPER ADMIN", "ADMIN"].includes(
        ur.role.name.toUpperCase(),
      ),
    );
    if (isSuper) return true;

    const userPerms = user.userRoles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.name.toLowerCase()),
    );

    return (
      userPerms.includes(requiredPermission.toLowerCase()) ||
      userPerms.includes("*")
    );
  } catch (error) {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const hasAccess = await verifyPermission(req, "seo:read");
    if (!hasAccess) {
      return NextResponse.json(
        { message: "Forbidden: Requires seo:read permission" },
        { status: 403 },
      );
    }

    const seoPages = await prisma.seoPage.findMany();
    return NextResponse.json(seoPages);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch SEO data" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const hasAccess = await verifyPermission(req, "seo:update");
    if (!hasAccess) {
      return NextResponse.json(
        { message: "Forbidden: Requires seo:update permission" },
        { status: 403 },
      );
    }

    const { pageName, metaTitle, metaDesc, keywords } = await req.json();

    const upsertedData = await prisma.seoPage.upsert({
      where: { pageName },
      update: { metaTitle, metaDesc, keywords },
      create: { pageName, metaTitle, metaDesc, keywords },
    });

    return NextResponse.json(upsertedData);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save SEO data" },
      { status: 500 },
    );
  }
}
