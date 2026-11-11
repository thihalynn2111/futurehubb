import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const partnerId = Number(id);

    if (!Number.isInteger(partnerId) || partnerId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid partner ID" },
        { status: 400 },
      );
    }

    const existing = await prisma.projects.findUnique({
      where: { id: partnerId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Partner not found" },
        { status: 404 },
      );
    }

    const updatePartner = await prisma.projects.update({
      where: { id: partnerId },
      data: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Partner restore successfully",
      data: updatePartner,
    });
  } catch (error) {
    console.error("RESTORE PARTNER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to restore partner",
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
    const partnerId = Number(id);

    if (!Number.isInteger(partnerId) || partnerId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID" },
        { status: 400 },
      );
    }

    const member = await prisma.projects.findUnique({
      where: { id: partnerId },
    });

    await prisma.projects.delete({
      where: { id: partnerId, deletedAt: { not: null } },
    });

    return NextResponse.json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PARTNER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete partner",
      },
      { status: 500 },
    );
  }
}
