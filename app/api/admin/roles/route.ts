import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// GET: Active Roles သို့မဟုတ် Trash Bin မှ ဖျက်ပြီးသား Role များကို ဆွဲထုတ်ရန်
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const isTrash = searchParams.get("trash") === "true"; // 🗑️ Trash bin query

    const roles = await prisma.role.findMany({
      where: isTrash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(roles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Role အသစ် ဖန်တီးရန်
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const body = await req.json();
    const { name, label, description } = body;

    if (!name || !label) {
      return NextResponse.json(
        { message: "Name and label are required" },
        { status: 400 },
      );
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        label,
        description: description || null,
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error: any) {
    console.error("Create role error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create role" },
      { status: 500 },
    );
  }
}

// DELETE: Soft Delete သို့မဟုတ် Permanent Delete လုပ်ရန် (?permanent=true ထည့်လျှင် အပြီးတိုင်ဖျက်မည်)
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

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
      // ⚠️ Foreign key constraints များကို အရင်ရှင်းထုတ်မည်
      await prisma.userRole.deleteMany({ where: { roleId: roleId } });

      // အပြီးတိုင် ဖျက်မည်
      await prisma.role.delete({ where: { id: roleId } });

      return NextResponse.json(
        { message: "Role permanently deleted successfully" },
        { status: 200 },
      );
    } else {
      // 🗑️ Soft Delete
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
    console.error("Delete role error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete role" },
      { status: 500 },
    );
  }
}
