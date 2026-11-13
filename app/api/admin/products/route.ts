import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET Method
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trashOnly = url.searchParams.get("trash") === "true";

    const products = await prisma.productPost.findMany({
      where: {
        deletedAt: trashOnly ? { not: null } : null,
      },
      include: {
        category: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. POST Method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 👇 type, content နဲ့ slug ကို လက်ခံအောင် ထည့်ထားပါတယ်
    const {
      title,
      description,
      categoryId,
      imageUrl,
      type,
      content,
      slug: customSlug,
    } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "Title and Category are required" },
        { status: 400 },
      );
    }

    // Custom Slug မပါလာရင် Title ကနေ အလိုအလျောက် ဖန်တီးမယ်
    const slug = customSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const parsedCategoryId = isNaN(Number(categoryId))
      ? categoryId
      : Number(categoryId);

    const newProduct = await prisma.productPost.create({
      data: {
        title,
        slug,
        description: description || "",
        imageUrl: imageUrl || "",
        type: type || "standard", // 👈 Frontend ကနေ ပါလာတဲ့ type ကို သုံးမယ်
        content: content || "", // 👈 Frontend ကနေ ပါလာတဲ့ content ကို သုံးမယ်
        authorType: "ADMIN",
        category: {
          connect: { id: parsedCategoryId },
        },
        author: {
          connect: {
            id: 1, // သင့် Admin User ID ကို ထည့်ပါ
          },
        },
      } as any,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Product create error details:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
