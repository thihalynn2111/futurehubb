import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.position) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and position are required",
        },
        { status: 400 },
      );
    }

    const newMember = await prisma.teamMember.create({
      data: {
        name: body.name,
        position: body.position,
        bio: body.bio || null,
        imageUrl: body.imageUrl || null,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Team member added successfully",
        data: newMember,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE TEAM MEMBER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add team member",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        deletedAt: null,
        isActive: true,
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
