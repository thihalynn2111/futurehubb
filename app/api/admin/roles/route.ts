import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// GET: ဖျက်ပြီးသား (deletedAt != null) မပါသော Role များကို ဆွဲထုတ်ရန်
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const roles = await prisma.role.findMany({
      where: { deletedAt: null }, // Soft delete မလုပ်ရသေးသော Role များသာ
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(roles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE: Role ကို Soft Delete လုပ်ရန်
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

    // Soft Delete: deletedAt တွင် လက်ရှိအချိန်ထည့်ခြင်းဖြင့် ဖျက်ပြီးသားအဖြစ် မှတ်မည်
    await prisma.role.update({
      where: { id: roleId },
      data: { deletedAt: new Date() } as any,
    });

    return NextResponse.json(
      { message: "Role soft deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete role error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete role" },
      { status: 500 },
    );
  }
}
