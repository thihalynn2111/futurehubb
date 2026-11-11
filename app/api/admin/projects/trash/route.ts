import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const partners = await prisma.projects.findMany({
      where: {
        deletedAt: { not: null },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: partners,
    });
  } catch (error) {
    console.error("GET PARTNERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch partner",
      },
      { status: 500 },
    );
  }
}
