import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: All product posts (active & trashed can be fetched here)
export async function GET() {
  try {
    const posts = await prisma.productPost.findMany({
      include: { category: true, cards: true, author: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Create a new product post
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, categoryId, imageUrl, description, slug } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "Title and category are required" },
        { status: 400 },
      );
    }

    // Auto generate slug if not provided
    const generatedSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newPost = await prisma.productPost.create({
      data: {
        title,
        slug: generatedSlug,
        categoryId: Number(categoryId),
        imageUrl: imageUrl || null,
        description: description || null,
        type: "default", // schema အရ လိုအပ်ပါက
        authorId: 1, // 👈 Admin User ID (သင့် Database ထဲက user id 1 ကို ဥပမာထားသည်)
        authorType: "USER",
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product post:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
