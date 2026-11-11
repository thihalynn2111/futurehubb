import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Soft Delete (Trash) or Permanent Delete
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent");

    if (permanent === "true") {
      await prisma.productPost.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json(
        { message: "Permanently deleted" },
        { status: 200 },
      );
    } else {
      const trashed = await prisma.productPost.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }, // Soft delete
      });
      return NextResponse.json(trashed, { status: 200 });
    }
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT: Restore from Trash
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const restored = await prisma.productPost.update({
      where: { id: Number(id) },
      data: { deletedAt: null }, // Restore by setting deletedAt to null
    });
    return NextResponse.json(restored, { status: 200 });
  } catch (error: any) {
    console.error("Restore error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
