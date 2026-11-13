import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1️⃣ PUT: Update Product OR Restore from Trash
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = Number((await params).id);
    const body = await req.json();

    // အကယ်၍ Request ထဲမှာ Restore လုပ်ရန် သို့မဟုတ် status ပြောင်းရန် သီးသန့်ပါလာလျှင် (သို့မဟုတ် Body ပါမလာလျှင် Restore လို့ ယူဆမည်)
    if (body.restore === true) {
      const restored = await prisma.productPost.update({
        where: { id },
        data: { deletedAt: null },
      });
      return NextResponse.json(restored, { status: 200 });
    }

    // သာမန် Product Update (Edit) လုပ်ခြင်း
    const { title, slug, categoryId, description, imageUrl } = body;

    const updatedProduct = await prisma.productPost.update({
      where: { id },
      data: {
        title,
        slug,
        categoryId: Number(categoryId),
        description,
        imageUrl,
      },
      include: {
        category: true,
        cards: true,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 },
    );
  }
}

// 2️⃣ DELETE: Soft Delete (Trash) or Permanent Delete
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent");

    if (permanent === "true") {
      await prisma.productPost.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json(
        { message: "Permanently deleted" },
        { status: 200 },
      );
    } else {
      const trashed = await prisma.productPost.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }, // Soft delete
      });
      return NextResponse.json(trashed, { status: 200 });
    }
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
