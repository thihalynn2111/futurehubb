import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const gallery = await prisma.gallery.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!gallery) {
      return NextResponse.json(
        {
          success: false,
          message: "Team member not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    console.error("GET GALLERY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch gallery",
      },
      { status: 500 },
    );
  }
}

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

    const body = await request.json();

    const existingGallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!existingGallery) {
      return NextResponse.json(
        { success: false, message: "Gallery not found" },
        { status: 404 },
      );
    }

    // Get values from frontend
    const title = body.title;
    const imageUrl = body.imageUrl;
    const sortOrder = body.sortOrder;
    const dateValue = body.date;

    // Handle date
    let date: Date | null;

    if (dateValue === undefined) {
      date = existingGallery.date;
    } else if (dateValue === null || dateValue === "") {
      date = null;
    } else {
      if (
        typeof dateValue !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid date format" },
          { status: 400 },
        );
      }

      const parsedDate = new Date(`${dateValue}T00:00:00.000Z`);

      if (
        isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().split("T")[0] !== dateValue
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid date" },
          { status: 400 },
        );
      }

      date = parsedDate;
    }

    // Update gallery
    const updatedGallery = await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        title:
          title !== undefined ? title?.trim() || null : existingGallery.title,

        date: date,

        imageUrl:
          imageUrl !== undefined && imageUrl !== ""
            ? imageUrl
            : existingGallery.imageUrl,

        sortOrder:
          sortOrder !== undefined
            ? Number(sortOrder)
            : existingGallery.sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gallery updated successfully",
      data: updatedGallery,
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

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!gallery || gallery.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Team gallery not found" },
        { status: 404 },
      );
    }

    await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        deletedAt: new Date(),
      },
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
        message: "Failed to delete Gallery",
      },
      { status: 500 },
    );
  }
}
