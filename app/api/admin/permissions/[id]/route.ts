import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// DELETE: Soft Delete (သို့မဟုတ် Permanent Delete) လုပ်ရန်
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

    const resolvedParams = await Promise.resolve(params);
    const permissionId = Number(resolvedParams.id);

    if (isNaN(permissionId)) {
      return NextResponse.json(
        { message: "Invalid Permission ID" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // ❌ Permanent Delete (Database မှ လုံးဝဖျက်မည်)
      await prisma.permission.delete({
        where: { id: permissionId },
      });

      return NextResponse.json(
        { message: "Permission permanently deleted successfully" },
        { status: 200 },
      );
    } else {
      // ♻️ Soft Delete: Trash သို့ ပို့မည်
      const updated = await prisma.permission.update({
        where: { id: permissionId },
        data: { deletedAt: new Date() } as any,
      });

      return NextResponse.json(
        { message: "Permission soft deleted successfully", updated },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("Delete permission error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete permission" },
      { status: 500 },
    );
  }
}

// PUT: Trash ထဲမှ ပြန်ဖော်ရန် (Restore)
export async function PUT(
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

    const resolvedParams = await Promise.resolve(params);
    const permissionId = Number(resolvedParams.id);

    if (isNaN(permissionId)) {
      return NextResponse.json(
        { message: "Invalid Permission ID" },
        { status: 400 },
      );
    }

    // ♻️ Restore: deletedAt ကို null သို့ ပြန်ပြောင်းမည်
    const restored = await prisma.permission.update({
      where: { id: permissionId },
      data: { deletedAt: null } as any,
    });

    return NextResponse.json(
      { message: "Permission restored successfully", restored },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Restore permission error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to restore permission" },
      { status: 500 },
    );
  }
}
