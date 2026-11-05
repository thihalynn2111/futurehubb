import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// ဥပမာ PATCH (Update) လုပ်သည့်အခါ Permission စစ်ဆေးခြင်း
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Token ကို စစ်ဆေးပြီး permissions များကို ထုတ်ယူပါ
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const permissions = (payload.permissions as string[]) || [];

    // 2. inquiries:update permission ရှိမရှိ စစ်ပါ
    if (!permissions.includes("inquiries:update")) {
      return NextResponse.json(
        { message: "Forbidden: You don't have update permission" },
        { status: 403 },
      );
    }

    // 3. မှန်ကန်ပါက ဆက်လုပ်ဆောင်ပါ
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.inquiry.update({
      where: { id: Number(id) },
      data: { status: body.status !== undefined ? Number(body.status) : 1 },
    });

    return NextResponse.json(
      { message: "Updated successfully", updated },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
