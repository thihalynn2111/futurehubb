import { connection, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  try {
    // deletedAt က null မဟုတ်ဘဲ အချိန်ရှိနေတဲ့ (Trash ထဲရောက်နေတဲ့) များကို ရှာမည်
    const trashed = await prisma.inquiry.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(trashed, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching trash:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
