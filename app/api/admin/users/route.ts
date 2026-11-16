import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
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
              include: { permissions: { include: { permission: true } } },
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
    const hasAccess = await verifyPermission(req, "users:read");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires users:read permission" },
        { status: 403 },
      );

    const { searchParams } = new URL(req.url);
    const isTrash = searchParams.get("trash") === "true";

    const users = await prisma.user.findMany({
      where: isTrash ? { deletedAt: { not: null } } : { deletedAt: null },
      include: { userRoles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((u: any) => {
      const roleName =
        u.userRoles && u.userRoles.length > 0
          ? u.userRoles.map((ur: any) => ur.role.name).join(", ")
          : "USER";

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: roleName,
        status: u.status !== undefined ? u.status : 1,
        deletedAt: u.deletedAt,
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const hasAccess = await verifyPermission(req, "users:create");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires users:create permission" },
        { status: 403 },
      );

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json(
        { message: "Please fill in all required fields" },
        { status: 400 },
      );
    if (role === "SUPER_ADMIN" || role === "SUPER ADMIN")
      return NextResponse.json(
        { message: "Cannot create another Super Admin account." },
        { status: 403 },
      );

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 },
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    const targetRole = await prisma.role.findUnique({
      where: { name: role || "EDITOR" },
    });

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        status: 1,
        userRoles: targetRole
          ? { create: [{ role: { connect: { id: targetRole.id } } }] }
          : undefined,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const currentUserId = Number(payload.userId || payload.id);

    const hasAccess = await verifyPermission(req, "users:update");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires users:update permission" },
        { status: 403 },
      );

    const body = await req.json();
    const { userId, status } = body;

    if (currentUserId === Number(userId)) {
      return NextResponse.json(
        { message: "You cannot change the status of your own account!" },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { status: Number(status) } as any,
    });

    return NextResponse.json(
      { message: "Status updated successfully", updatedUser },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update status" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const currentUserId = Number(payload.userId || payload.id);

    const hasAccess = await verifyPermission(req, "users:delete");
    if (!hasAccess)
      return NextResponse.json(
        { message: "Forbidden: Requires users:delete permission" },
        { status: 403 },
      );

    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!rawId)
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 },
      );

    const userId = Number(rawId);

    if (currentUserId === userId) {
      return NextResponse.json(
        { message: "You cannot delete your own account!" },
        { status: 403 },
      );
    }

    const targetUser: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isSuperAdmin = targetUser.userRoles?.some(
      (ur: any) => ur.role.name === "SUPER_ADMIN",
    );
    if (isSuperAdmin || targetUser.email === "admin@futurehub.com") {
      return NextResponse.json(
        { message: "Super Admin account cannot be deleted!" },
        { status: 403 },
      );
    }

    if (permanent) {
      // 🚀 အပြီးတိုင်ဖျက်မယ်ဆိုရင် အရင်ဆုံး သူ့မှာ Post တွေ ရှိမရှိ စစ်ပါ
      const postsCount = await prisma.productPost.count({
        where: { authorId: userId },
      });
      if (postsCount > 0) {
        return NextResponse.json(
          {
            message:
              "Cannot permanently delete this user because they have existing posts. Please reassign or delete their posts first.",
          },
          { status: 400 },
        );
      }

      // ပြီးမှ သူ့ရဲ့ Role Relationship တွေကို အရင်ဖျက်ပါ
      await prisma.userRole.deleteMany({ where: { userId } });

      // နောက်ဆုံးမှ User ကို ဖျက်ပါ
      await prisma.user.delete({ where: { id: userId } });

      return NextResponse.json(
        { message: "User permanently deleted successfully" },
        { status: 200 },
      );
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), status: 0 } as any,
      });
      return NextResponse.json(
        { message: "User soft deleted successfully" },
        { status: 200 },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}
