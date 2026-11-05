import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cardId = Number(id);

    if (!Number.isInteger(cardId) || cardId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID" },
        { status: 400 },
      );
    }

    const member = await prisma.projects.findUnique({
      where: { id: cardId },
    });

    if (!member || member.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 },
      );
    }

    await prisma.cardItem.update({
      where: { id: cardId },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "card deleted successfully",
    });
  } catch (error) {
    console.error("DELETE card ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete card",
      },
      { status: 500 },
    );
  }
}
