import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const partner = await prisma.project.findUnique({
      where: {
        id: Number(id),
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const partnerID = Number(id);

    if (!Number.isInteger(partnerID) || partnerID <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid partner ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const existingPartner = await prisma.project.findUnique({
      where: { id: partnerID },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, message: "Patner not found" },
        { status: 404 },
      );
    }

    const title = body.title || body.formData?.title;
    const subtitle = body.subtitle || body.formData?.subtitle;
    const description = body.description || body.formData?.description;
    const imageUrl = body.imageUrl;

    const updatedPartner = await prisma.project.update({
      where: { id: partnerID },
      data: {
        title: title ? title.trim() : existingPartner.title,
        subtitle: subtitle ? subtitle.trim() : existingPartner.subtitle,
        description:
          description !== undefined ? description : existingPartner.description,

        clientLogo:
          imageUrl !== undefined && imageUrl !== ""
            ? imageUrl
            : existingPartner.clientLogo,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Partner updated successfully",
      data: updatedPartner,
    });
  } catch (error) {
    console.error("UPDATE PARTNER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update partner ",
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
    const partnerID = Number(id);

    if (!Number.isInteger(partnerID) || partnerID <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID" },
        { status: 400 },
      );
    }

    const member = await prisma.projects.findUnique({
      where: { id: partnerID },
    });

    if (!member || member.deletedAt !== null) {
      return NextResponse.json(
        { success: false, message: "Partner not found" },
        { status: 404 },
      );
    }

    await prisma.projects.update({
      where: { id: partnerID },
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
