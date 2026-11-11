import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const memberId = Number(id);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID" },
        { status: 400 },
      );
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 },
      );
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        deletedAt: null,
        isActive: true,
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const memberId = Number(id);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID" },
        { status: 400 },
      );
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    await prisma.teamMember.delete({
      where: { id: memberId },
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
