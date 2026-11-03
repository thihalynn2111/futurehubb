import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// GET: ဖျက်ပြီးသား (deletedAt != null) မပါသော Permissions များကို ဆွဲထုတ်ရန်
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const permissions = await prisma.permission.findMany({
      where: { deletedAt: null }, // Soft delete မလုပ်ရသေးသော permission များသာ[cite: 6]
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(permissions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
