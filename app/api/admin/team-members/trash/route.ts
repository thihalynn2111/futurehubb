import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        deletedAt: { not: null },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: members,
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
