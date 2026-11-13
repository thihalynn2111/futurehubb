import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET Method (Product List အားလုံးကို ဆွဲထုတ်ရန်)
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

// 2. POST Method (Product အသစ် ဖန်တီးရန်)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 👇 Frontend ကနေ ပါလာတဲ့ Data တွေကို လက်ခံမယ်
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

    // Category ID ကို Number ပြောင်းမယ် (လိုအပ်ရင်)
    const parsedCategoryId = isNaN(Number(categoryId))
      ? categoryId
      : Number(categoryId);

    // Database ထဲ သိမ်းဆည်းမယ်
    const newProduct = await prisma.productPost.create({
      data: {
        title,
        slug,
        description: description || "",
        imageUrl: imageUrl || "",
        type: type || "standard", // 👈 Type ကို သိမ်းမယ်
        content: content || "", // 👈 Content ကို သိမ်းမယ်
        authorType: "ADMIN",
        category: {
          connect: { id: parsedCategoryId },
        },
        author: {
          connect: {
            id: 1, // ⚠️ သင့် Admin User ID ကို သေချာ ထည့်ပါ (Database ထဲမှာ ရှိတဲ့ ID ဖြစ်ရပါမယ်)
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
