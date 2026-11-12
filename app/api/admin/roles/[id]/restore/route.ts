import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const roleId = Number(params.id);
    if (!roleId)
      return NextResponse.json({ message: "Invalid Role ID" }, { status: 400 });

    // ♻️ deletedAt ကို null သို့ ပြန်ပြောင်းမည်
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
