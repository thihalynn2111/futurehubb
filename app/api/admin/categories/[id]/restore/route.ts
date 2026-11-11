import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    const restoredCategory = await prisma.productCategory.update({
      where: { id },
      data: { deletedAt: null }, // Trash မှ ပြန်ထုတ်မည်
    });

    return NextResponse.json(
      { message: "Category restored successfully", restoredCategory },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
