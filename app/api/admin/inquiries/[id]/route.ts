import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    const { reply, status } = await req.json();

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        reply,
        status: status !== undefined ? Number(status) : undefined,
      },
    });

    return NextResponse.json(
      { message: "Updated successfully", updated },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
