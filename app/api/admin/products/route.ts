import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Website တွင် ပြသမည့် ပစ္စည်းများကို ဆွဲထုတ်ခြင်း (deletedAt မရှိသေးသော / Trash ထဲမရောက်သေးသော ဟာများသာ)
    const products = await prisma.productPost.findMany({
      where: {
        deletedAt: null, // 🔥 Product Post Trash ထဲ မရောက်သေးရပါမည်
        category: {
          deletedAt: null, // 🔥 Category ပါ Trash ထဲ မရောက်သေးရပါမည်
        },
      },
      include: {
        category: true,
        cards: {
          where: {
            deletedAt: null, // 🔥 Card Item များထဲမှလည်း Trash ထဲရောက်နေသည်များကို ဖယ်ထုတ်မည်
          },
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching public products:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
