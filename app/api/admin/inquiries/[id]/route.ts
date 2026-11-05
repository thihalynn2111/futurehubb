import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// PATCH: Update Inquiry (e.g. Save as Draft / Restore from Trash)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Token ကို စစ်ဆေးခြင်း
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const roles = (payload.roles as string[]) || [];
    const permissions = (payload.permissions as string[]) || [];

    const isSuperAdmin = roles.some(
      (r) =>
        r.toLowerCase() === "super-admin" ||
        r.toLowerCase() === "super_admin" ||
        r.toLowerCase() === "admin",
    );

    // 2. Permission စစ်ဆေးခြင်း
    if (!isSuperAdmin && !permissions.includes("inquiries:update")) {
      return NextResponse.json(
        { message: "Forbidden: You don't have update permission" },
        { status: 403 },
      );
    }

    // 3. Update / Restore လုပ်ဆောင်ရန်
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status !== undefined) {
      updateData.status = Number(body.status);
    }
    // အကယ်၍ restore လုပ်ရန် body ထဲတွင် restore: true ပါလာပါက deletedAt ကို null ပြန်လုပ်မည်
    if (body.restore) {
      updateData.deletedAt = null;
    }

    const updated = await prisma.inquiry.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Updated successfully", updated },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE: Soft Delete Inquiry (Trash)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const roles = (payload.roles as string[]) || [];
    const permissions = (payload.permissions as string[]) || [];

    const isSuperAdmin = roles.some(
      (r) =>
        r.toLowerCase() === "super-admin" ||
        r.toLowerCase() === "super_admin" ||
        r.toLowerCase() === "admin",
    );

    if (!isSuperAdmin && !permissions.includes("inquiries:delete")) {
      return NextResponse.json(
        { message: "Forbidden: You don't have delete permission" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const deletedInquiry = await prisma.inquiry.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Inquiry moved to trash successfully", deletedInquiry },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
