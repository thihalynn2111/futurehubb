import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.title?.trim() ||
      !body.description?.trim() ||
      !body.clientLogo?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Title,logo and description are required" },
        { status: 400 },
      );
    }
    const baseSlug = generateSlug(body.title);

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
      await prisma.projects.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new project
    const newProject = await prisma.projects.create({
      data: {
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        description: body.description.trim(),
        clientLogo: body.clientLogo || null,
        sortOrder: Number(body.sortOrder) || 0,
        slug: slug,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "New project added successfully",
        data: newProject,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add new project",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const projects = await prisma.projects.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch projects",
      },
      { status: 500 },
    );
  }
}
