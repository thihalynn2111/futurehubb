import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const seoPages = await prisma.seoPage.findMany();
    return NextResponse.json(seoPages);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch SEO data" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { pageName, metaTitle, metaDesc, keywords } = await req.json();

    const upsertedData = await prisma.seoPage.upsert({
      where: { pageName },
      update: { metaTitle, metaDesc, keywords },
      create: { pageName, metaTitle, metaDesc, keywords },
    });

    return NextResponse.json(upsertedData);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save SEO data" },
      { status: 500 },
    );
  }
}
