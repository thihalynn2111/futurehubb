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
    const userId = Number(resolvedParams.id);

    if (!userId) {
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }

    // ♻️ deletedAt ကို null ပြန်ထားမယ်၊ status ကို 1 ပြန်ထားမယ်
    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        status: 1,
      } as any,
    });

    return NextResponse.json(
      { message: "User restored successfully", restoredUser },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Restore user error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to restore user" },
      { status: 500 },
    );
  }
}
