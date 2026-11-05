import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { title, slug, categoryId, description } = body;

    const updatedProduct = await prisma.productPost.update({
      where: { id },
      data: {
        title,
        slug,
        categoryId: Number(categoryId),
        description,
      },
      include: {
        category: true,
        cardItems: true,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
