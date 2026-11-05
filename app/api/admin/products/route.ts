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
    const { title, description, categoryId, imageUrl } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "Title and Category are required" },
        { status: 400 },
      );
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const parsedCategoryId = isNaN(Number(categoryId))
      ? categoryId
      : Number(categoryId);

    // 🔥 Database schema တွင် required ဖြစ်နေသော author, authorType, type နှင့် category ကို ဖြည့်စွက်ခြင်း
    // (အကယ်၍ Admin user id က 1 ဖြစ်နေပါက authorId: 1 ဟା သို့မဟုတ် connect ဖြင့် ချိတ်ပါ)
    const newProduct = await prisma.productPost.create({
      data: {
        title,
        slug,
        description: description || "",
        imageUrl: imageUrl || "",
        type: "DEFAULT",
        authorType: "ADMIN",
        // Category relation
        category: {
          connect: { id: parsedCategoryId },
        },
        // 🔥 အကယ်၍ your schema uses authorId (number/string) သို့မဟုတ် author relation:
        // ပထမဆုံး Admin User ကို ရှာပြီး ချိတ်ဆက်ပေးခြင်း (သို့မဟုတ် authorId: 1 ဟု တိုက်ရိုက်ထည့်နိုင်သည်)
        author: {
          connect: {
            id: 1, // သင့် Database ထဲရှိ Admin User ၏ ID (သို့မဟုတ် ပထမဆုံး User ID) ကို ထည့်ပါ
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
