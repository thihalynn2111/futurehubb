import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function PUT(
  req: Request,
  // 🚀 Next.js 15 အတွက် params ကို Promise အနေနဲ့ လက်ခံရပါမယ်
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await jwtVerify(token, JWT_SECRET);

    // 🚀 await လုပ်ပြီးမှ id ကို ယူရပါမယ်
    const resolvedParams = await params;
    const roleId = Number(resolvedParams.id);

    if (!roleId) {
      return NextResponse.json({ message: "Invalid Role ID" }, { status: 400 });
    }

    // ♻️ deletedAt ကို null ပြန်ထားမယ်
    await prisma.role.update({
      where: { id: roleId },
      data: { deletedAt: null } as any,
    });

    return NextResponse.json(
      { message: "Role restored successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to restore role" },
      { status: 500 },
    );
  }
}
