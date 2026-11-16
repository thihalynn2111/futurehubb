import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
function generateSlug(name: string) {
  return name
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

    const partner = await prisma.projects.findUnique({
      where: {
        slug: slug,
        deletedAt: null,
      },
    });

    if (!partner) {
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
      data: partner,
    });
  } catch (error) {
    console.error("GET Partner ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch team member",
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
        { success: false, message: "Invalid partner slug" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim() || !body.subtitle?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "title and subtitle are required",
        },
        { status: 400 },
      );
    }

    const existingPartner = await prisma.projects.findUnique({
      where: { slug },
    });

    if (!existingPartner || existingPartner.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Partner & Project not found" },
        { status: 404 },
      );
    }

    const newSlug = generateSlug(body.title);

    if (!newSlug) {
      return NextResponse.json(
        { success: false, message: "Invalid name for slug generation" },
        { status: 400 },
      );
    }

    // Check duplicate slug
    const existingSlug = await prisma.projects.findUnique({
      where: { slug: newSlug },
    });

    if (existingSlug && existingSlug.id !== existingPartner.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This name already exists. Please use another name.",
        },
        { status: 409 },
      );
    }

    // Update member
    const updatedMember = await prisma.projects.update({
      where: { slug },
      data: {
        title: body.title.trim(),
        slug: newSlug,
        subtitle: body.subtitle.trim(),
        description: body.description?.trim() || null,
        clientLogo: body.clientLogo || null,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Partner & project updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("UPDATE PARTNER & PROJECT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update partner & project",
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
    const partnerSlug = slug;

    const partner = await prisma.projects.findUnique({
      where: { slug: partnerSlug },
    });

    if (!partner || partner.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Partner not found" },
        { status: 404 },
      );
    }

    await prisma.projects.update({
      where: { slug: partnerSlug },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "partner deleted successfully",
    });
  } catch (error) {
    console.error("DELETE partner ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete partner",
      },
      { status: 500 },
    );
  }
}
