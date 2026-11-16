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
export async function GET() {
  try {
    const gallery = await prisma.gallery.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim() || !body.date?.trim() || !body.imageUrl?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title,image and date are required" },
        { status: 400 },
      );
    }
    const baseSlug = generateSlug(body.title);

    if (!baseSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Please use an English project title for slug generation",
        },
        { status: 400 },
      );
    }

    // 2. Check whether slug already exists
    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.projects.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    // Create new project
    const newGallery = await prisma.gallery.create({
      data: {
        imageUrl: body.imageUrl.trim(),
        title: body.title?.trim() || null,
        date: body.date ? new Date(`${body.date}T00:00:00.000Z`) : null,
        sortOrder: Number(body.sortOrder) || 0,
        slug: slug,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "New gallery added successfully",
        data: newGallery,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE GALLERY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add new gallery",
      },
      { status: 500 },
    );
  }
}
