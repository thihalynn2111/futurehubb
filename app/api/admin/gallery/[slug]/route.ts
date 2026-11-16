import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const gallery = await prisma.gallery.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        {
          success: false,
          message: "Gallery not found",
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
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug || slug === "undefined") {
      return NextResponse.json(
        { success: false, message: "Invalid gallery slug" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim() || !body.date || !body.imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Title,date and image are required",
        },
        { status: 400 },
      );
    }

    // Find existing member using current slug
    const existing = await prisma.gallery.findUnique({
      where: { slug },
    });

    if (!existing || existing.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Gallery not found" },
        { status: 404 },
      );
    }

    // Generate new slug from updated name
    const newSlug = generateSlug(body.title);

    if (!newSlug) {
      return NextResponse.json(
        { success: false, message: "Invalid name for slug generation" },
        { status: 400 },
      );
    }

    // Check duplicate slug
    const existingSlug = await prisma.gallery.findUnique({
      where: { slug: newSlug },
    });

    if (existingSlug && existingSlug.id !== existing.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This name already exists. Please use another name.",
        },
        { status: 409 },
      );
    }

    // Update member
    const title = body.title;
    const imageUrl = body.imageUrl;
    const sortOrder = body.sortOrder;
    const dateValue = body.date;

    // Handle date
    let date: Date | null;

    if (dateValue === undefined) {
      date = existing.date;
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
      where: { slug: slug },
      data: {
        title: title !== undefined ? title?.trim() || null : existing.title,

        date: date,

        imageUrl:
          imageUrl !== undefined && imageUrl !== ""
            ? imageUrl
            : existing.imageUrl,

        sortOrder:
          sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
        slug: newSlug,
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
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const gallerySlug = slug;

    const gallery = await prisma.gallery.findUnique({
      where: { slug: gallerySlug },
    });

    if (!gallery || gallery.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Gallery not found" },
        { status: 404 },
      );
    }

    await prisma.gallery.update({
      where: { slug: gallerySlug },
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
