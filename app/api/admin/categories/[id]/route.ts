import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✏️ UPDATE or RESTORE (PUT method)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await req.json().catch(() => ({}));

    // 🚀 ဤနေရာတွင် restore: true ပါလာပါက deletedAt ကို null သို့ ပြောင်းပေးမည် (Restore လုပ်ခြင်း)
    if (body.restore === true) {
      const restoredCategory = await prisma.productCategory.update({
        where: { id },
        data: { deletedAt: null },
      });
      return NextResponse.json(
        { message: "Category restored successfully", restoredCategory },
        { status: 200 },
      );
    }

    // သာမန် Category Update (Edit) လုပ်ခြင်း
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        status: body.status !== undefined ? Number(body.status) : undefined,
      },
    });

    return NextResponse.json(
      { message: "Category updated successfully", updatedCategory },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update/Restore error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✏️ UPDATE or RESTORE (PATCH method alternative)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await req.json().catch(() => ({}));

    // 🚀 PATCH ဖြင့် restore လုပ်ရန် ပါလာလျှင်
    if (body.restore === true) {
      const restoredCategory = await prisma.productCategory.update({
        where: { id },
        data: { deletedAt: null },
      });
      return NextResponse.json(
        { message: "Category restored successfully", restoredCategory },
        { status: 200 },
      );
    }

    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        status: body.status !== undefined ? Number(body.status) : undefined,
      },
    });

    return NextResponse.json(
      { message: "Category updated successfully", updatedCategory },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Patch error:", error);
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
      // ❌ Permanent Delete: ဆက်စပ်နေသော product posts များကို အရင်ဖျက်မည်
      await prisma.productPost.deleteMany({
        where: { categoryId: id },
      });

      await prisma.productCategory.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Category and related posts permanently deleted" },
        { status: 200 },
      );
    } else {
      // ♻️ Soft Delete (Trash သို့ ပို့မည်)
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
    console.error("Permanent delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
