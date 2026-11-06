import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// DELETE: Soft Delete သို့မဟုတ် Permanent Delete (?permanent=true)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const resolvedParams = await Promise.resolve(params);
    const settingId = Number(resolvedParams.id);

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await prisma.siteSetting.delete({ where: { id: settingId } });
      return NextResponse.json({ message: "Site setting permanently deleted" });
    } else {
      const updated = await prisma.siteSetting.update({
        where: { id: settingId },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({
        message: "Site setting moved to trash",
        updated,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete" },
      { status: 500 },
    );
  }
}

// PUT: Trash မှ ပြန်ဖော်ရန် (Restore)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const resolvedParams = await Promise.resolve(params);
    const settingId = Number(resolvedParams.id);

    const restored = await prisma.siteSetting.update({
      where: { id: settingId },
      data: { deletedAt: null },
    });

    return NextResponse.json({
      message: "Site setting restored successfully",
      restored,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to restore" },
      { status: 500 },
    );
  }
}
