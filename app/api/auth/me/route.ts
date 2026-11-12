import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = Number(payload.id || payload.userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid token payload" },
        { status: 401 },
      );
    }

    // Database မှ User, ၎င်း၏ userRoles နှင့် rolePermissions များကို အပြည့်အစုံ ဆွဲထုတ်မည်
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 🔍 status တန်ဖိုး မကိုက်ညီမှုကြောင့် 401 မတက်စေရန် deletedAt ကိုသာ အဓိကထားစစ်ဆေးမည်
    if (!user || user.deletedAt) {
      return NextResponse.json(
        { message: "User not found or inactive" },
        { status: 401 },
      );
    }

    const roles: string[] = [];
    const roleIds: number[] = [];

    user.userRoles.forEach((ur: any) => {
      if (ur.role && !ur.role.deletedAt) {
        roles.push(ur.role.name);
        roleIds.push(ur.role.id);
      }
    });

    const isSuper = roles.some(
      (r) =>
        r.toLowerCase() === "super_admin" ||
        r.toLowerCase() === "super-admin" ||
        r.toLowerCase() === "admin" ||
        r.toLowerCase() === "system",
    );

    let permissions: string[] = [];

    if (isSuper) {
      permissions = ["*"];
    } else {
      // 🔍 Database မှ Assigned လုပ်ထားသော permissions များကို တိုက်ရိုက်ဆွဲထုတ်မည်
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: { in: roleIds } },
        include: { permission: true },
      });

      rolePermissions.forEach((rp: any) => {
        if (rp.permission && !rp.permission.deletedAt) {
          permissions.push(rp.permission.name);
        }
      });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: roles,
          permissions: permissions,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
