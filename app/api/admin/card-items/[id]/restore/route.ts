import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    const restoredCard = await prisma.cardItem.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json(
      { message: "Card item restored successfully", restoredCard },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
