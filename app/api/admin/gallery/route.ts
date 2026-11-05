import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error("GET TEAM MEMBERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team members",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    // if (!body.title?.trim() || !body.date?.trim()) {
    //   return NextResponse.json(
    //     { success: false, message: "Title and description are required" },
    //     { status: 400 },
    //   );
    // }

    // Create new project
    const newGallery = await prisma.gallery.create({
      data: {
        imageUrl: body.imageUrl.trim(),
        title: body.title?.trim() || null,
        date: body.date ? new Date(`${body.date}T00:00:00.000Z`) : null,
        sortOrder: Number(body.sortOrder) || 0,
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
