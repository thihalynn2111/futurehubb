import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.productPost.findMany({
    include: { category: true, cards: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { title, categoryId, description, imageUrl, authorId } =
    await req.json();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const product = await prisma.productPost.create({
    data: {
      title,
      slug,
      categoryId: Number(categoryId),
      description,
      imageUrl,
      type: "STANDARD",
      authorId: authorId ? Number(authorId) : 1, // Default user ID 1
      authorType: "USER",
    },
  });
  return NextResponse.json(product, { status: 201 });
}
