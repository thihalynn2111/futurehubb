import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// GET: ဖျက်ပြီးသားများ (deletedAt != null) ကို နှုတ်ထုတ်၍ ဆွဲထုတ်ရန်
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await jwtVerify(token, JWT_SECRET);

    const users = await prisma.user.findMany({
      where: { deletedAt: null }, // Soft delete ဖြစ်ပြီးသားများကို မပါစေရန် စစ်ထုတ်မည်
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
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
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error: any) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST: User အသစ် ဖန်တီးရန်
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await jwtVerify(token, JWT_SECRET);

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please fill in all required fields" },
        { status: 400 },
      );
    }

    if (role === "SUPER_ADMIN" || role === "SUPER ADMIN") {
      return NextResponse.json(
        { message: "Cannot create another Super Admin account." },
        { status: 403 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 },
      );
    }

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
          ? {
              create: [{ role: { connect: { id: targetRole.id } } }],
            }
          : undefined,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH: Status ပြောင်းရန်
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const body = await req.json();
    const { userId, status } = body;

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

// DELETE: Soft Delete (Database မှ လုံးဝမဖျက်ဘဲ deletedAt ဖြည့်မည်)
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");
    if (!rawId)
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 },
      );

    const userId = Number(rawId);

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

    // Soft Delete: database မှ မဖျက်ဘဲ deletedAt နှင့် status ကို update လုပ်မည်
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 0, // Archived / Banned
      } as any,
    });

    return NextResponse.json(
      { message: "User soft deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Soft delete user error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}
