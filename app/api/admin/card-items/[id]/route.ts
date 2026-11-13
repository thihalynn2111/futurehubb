import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1️⃣ PUT: Update Card Item (Edit Title, Description, Image)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, imageUrl, productId } = body;

    const updatedCard = await prisma.cardItem.update({
      where: { id: Number(id) },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(productId ? { productId: Number(productId) } : {}),
      },
    });

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error: any) {
    console.error("Error updating card item:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2️⃣ DELETE: Soft Delete (Trash) or Permanent Delete Card Item
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
