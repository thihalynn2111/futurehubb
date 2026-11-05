import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch card items (productId ပါလာပါက ၎င်းနှင့်ဆိုင်သော cards များကိုသာ စစ်ထုတ်ပေးမည်)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");

    const cards = await prisma.cardItem.findMany({
      where: {
        // 🔥 productId ပါလာပါက ၎င်းနှင့်ကိုက်ညီသော cards များကိုသာ ယူမည် (မပါလျှင် အားလုံးယူမည်)
        ...(productId ? { productId: Number(productId) } : {}),
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(cards, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching card items:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Create a new card item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, title, description, imageUrl, type } = body;

    if (!productId || !title) {
      return NextResponse.json(
        { message: "Product ID and title are required" },
        { status: 400 },
      );
    }

    const newCard = await prisma.cardItem.create({
      data: {
        productId: Number(productId),
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        type: type || "default",
        creatorId: 1, // Default Admin User ID
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error: any) {
    console.error("Error creating card item:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
