import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { productId, title, description, imageUrl, number } = await req.json();

  const card = await prisma.cardItem.create({
    data: {
      productId: Number(productId),
      title,
      description,
      imageUrl,
      number,
      type: "PRODUCT_INFO",
    },
  });
  return NextResponse.json(card, { status: 201 });
}
