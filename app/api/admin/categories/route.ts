import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trashOnly = url.searchParams.get("trash") === "true";
    const activeOnly = url.searchParams.get("active") === "true";

    let whereClause: any = {};

    if (trashOnly) {
      whereClause = { deletedAt: { not: null } }; // Trash Bin အတွက် (deletedAt ရှိသည်များ)
    } else if (activeOnly) {
      whereClause = { deletedAt: null }; // Website Navbar အတွက် (Active ဖြစ်သည်များ)
    } else {
      // Parameter မပါပါက Default အနေဖြင့် Website Navbar အတွက် Active များကိုသာ ပြမည်
      whereClause = { deletedAt: null };
    }

    const categories = await prisma.productCategory.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await prisma.productCategory.create({
      data: { name, slug },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
