import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await jwtVerify(token, JWT_SECRET);

    // Next.js App Router ဗားရှင်းအလိုက် params ကို safely resolve လုပ်ခြင်း
    const resolvedParams = await Promise.resolve(params);
    const permissionId = Number(resolvedParams.id);

    if (isNaN(permissionId)) {
      return NextResponse.json(
        { message: "Invalid Permission ID" },
        { status: 400 },
      );
    }

    // Soft Delete: Database မှ လုံးဝမဖျက်ဘဲ deletedAt တွင် လက်ရှိအချိန်ကို ထည့်မည်
    const updated = await prisma.permission.update({
      where: { id: permissionId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Permission soft deleted successfully", updated },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete permission error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete permission" },
      { status: 500 },
    );
  }
}
