import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.position || !body.imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Name,image and position are required",
        },
        { status: 400 },
      );
    }
    const baseSlug = generateSlug(body.name);

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
      await prisma.teamMember.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newMember = await prisma.teamMember.create({
      data: {
        name: body.name,
        position: body.position,
        bio: body.bio || null,
        imageUrl: body.imageUrl || null,
        sortOrder: Number(body.sortOrder) || 0,
        slug: slug,
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
  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
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
