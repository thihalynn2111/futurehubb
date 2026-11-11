import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const galleryId = Number(id);

    if (!Number.isInteger(galleryId) || galleryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid gallery ID" },
        { status: 400 },
      );
    }

    const existing = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Gallery not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gallery updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE GALLERY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update gallery",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const galleryId = Number(id);

    if (!Number.isInteger(galleryId) || galleryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid gallery ID" },
        { status: 400 },
      );
    }

    const member = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    await prisma.gallery.delete({
      where: { id: galleryId },
    });

    return NextResponse.json({
      success: true,
      message: "Gallery deleted successfully",
    });
  } catch (error) {
    console.error("DELETE GALLERY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete gallery",
      },
      { status: 500 },
    );
  }
}
