import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: Soft Delete or Permanent Delete Card Item
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent");

    if (permanent === "true") {
      await prisma.cardItem.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json(
        { message: "Card item permanently deleted" },
        { status: 200 },
      );
    } else {
      const trashed = await prisma.cardItem.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json(trashed, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error deleting card item:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT: Restore Card Item from Trash
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const restored = await prisma.cardItem.update({
      where: { id: Number(id) },
      data: { deletedAt: null },
    });
    return NextResponse.json(restored, { status: 200 });
  } catch (error: any) {
    console.error("Error restoring card item:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
