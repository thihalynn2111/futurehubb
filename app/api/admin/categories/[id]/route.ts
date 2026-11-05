import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✏️ UPDATE (Edit name/slug or change status / archive / draft)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await req.json();

    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        status: body.status !== undefined ? Number(body.status) : undefined, // 1: Active, 0: Draft, 2: Archive
      },
    });

    return NextResponse.json(
      { message: "Category updated successfully", updatedCategory },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 🗑️ DELETE (Soft Delete vs Permanent Delete)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // ❌ Permanent Delete (အပြီးတိုင်ဖျက်မည်)
      await prisma.productCategory.delete({
        where: { id },
      });
      return NextResponse.json(
        { message: "Category permanently deleted" },
        { status: 200 },
      );
    } else {
      // ♻️ Soft Delete (Trash သို့ ပို့မည် - deletedAt တွင် အချိန်ထည့်မည်)
      const softDeleted = await prisma.productCategory.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json(
        { message: "Category moved to trash", softDeleted },
        { status: 200 },
      );
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
