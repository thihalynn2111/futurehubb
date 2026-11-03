import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.productCategory.findMany();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const category = await prisma.productCategory.create({
    data: { name, slug },
  });
  return NextResponse.json(category, { status: 201 });
}
