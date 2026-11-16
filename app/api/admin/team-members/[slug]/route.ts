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

    const member = await prisma.teamMember.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!member) {
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
      data: member,
    });
  } catch (error) {
    console.error("GET TEAM MEMBER ERROR:", error);

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
        { success: false, message: "Invalid team member slug" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.position?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and position are required",
        },
        { status: 400 },
      );
    }

    // Find existing member using current slug
    const existingMember = await prisma.teamMember.findUnique({
      where: { slug },
    });

    if (!existingMember || existingMember.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 },
      );
    }

    // Generate new slug from updated name
    const newSlug = generateSlug(body.name);

    if (!newSlug) {
      return NextResponse.json(
        { success: false, message: "Invalid name for slug generation" },
        { status: 400 },
      );
    }

    // Check duplicate slug
    const existingSlug = await prisma.teamMember.findUnique({
      where: { slug: newSlug },
    });

    if (existingSlug && existingSlug.id !== existingMember.id) {
      return NextResponse.json(
        {
          success: false,
          message: "This name already exists. Please use another name.",
        },
        { status: 409 },
      );
    }

    // Update member
    const updatedMember = await prisma.teamMember.update({
      where: { slug },
      data: {
        name: body.name.trim(),
        slug: newSlug,
        position: body.position.trim(),
        bio: body.bio?.trim() || null,
        imageUrl: body.imageUrl || null,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("UPDATE TEAM MEMBER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update team member",
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

    if (!slug || slug === "undefined") {
      return NextResponse.json(
        { success: false, message: "Invalid team member slug" },
        { status: 400 },
      );
    }

    // Find member using slug
    const member = await prisma.teamMember.findUnique({
      where: { slug },
    });

    if (!member || member.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 },
      );
    }

    // Soft delete member
    await prisma.teamMember.update({
      where: { slug },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TEAM MEMBER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete team member",
      },
      { status: 500 },
    );
  }
}
