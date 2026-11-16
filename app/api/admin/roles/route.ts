import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

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

    if (!user) return false;

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
    const hasAccess = await verifyPermission(req, "roles:read");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires roles:read permission" },
        { status: 403 },
      );

    const { searchParams } = new URL(req.url);
    const isTrash = searchParams.get("trash") === "true";

    const roles = await prisma.role.findMany({
      where: isTrash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(roles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const hasAccess = await verifyPermission(req, "roles:create");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires roles:create permission" },
        { status: 403 },
      );

    const body = await req.json();
    const { name, label, description } = body;

    if (!name || !label)
      return NextResponse.json(
        { message: "Name and label are required" },
        { status: 400 },
      );

    const newRole = await prisma.role.create({
      data: { name, label, description: description || null },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create role" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const hasAccess = await verifyPermission(req, "roles:delete");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires roles:delete permission" },
        { status: 403 },
      );

    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!rawId)
      return NextResponse.json(
        { message: "Role ID required" },
        { status: 400 },
      );

    const roleId = Number(rawId);
    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });

    if (!targetRole || targetRole.name === "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Protected role cannot be deleted!" },
        { status: 403 },
      );
    }

    if (permanent) {
      // 🚀 အပြီးတိုင်ဖျက်မယ်ဆိုရင် -

      // ၁။ သူ့အောက်က UserRole တွေကို အရင်ဖျက်မယ်
      await prisma.userRole.deleteMany({ where: { roleId: roleId } });

      // ၂။ သူ့အောက်က RolePermission တွေကို အရင်ဖျက်မယ်
      await prisma.rolePermission.deleteMany({ where: { roleId: roleId } });

      // ၃။ ပြီးမှ Role ကို ဖျက်မယ်
      await prisma.role.delete({ where: { id: roleId } });

      return NextResponse.json(
        { message: "Role permanently deleted successfully" },
        { status: 200 },
      );
    } else {
      await prisma.role.update({
        where: { id: roleId },
        data: { deletedAt: new Date() } as any,
      });
      return NextResponse.json(
        { message: "Role soft deleted successfully" },
        { status: 200 },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete role" },
      { status: 500 },
    );
  }
}
