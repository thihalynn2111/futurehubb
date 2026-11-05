import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isTrashed = searchParams.get("status") === "trashed";

    const inquiries = await prisma.inquiry.findMany({
      where: isTrashed
        ? { deletedAt: { not: null } } // Trash Bin အတွက် (deletedAt မဟုတ်သည်များ)
        : { deletedAt: null }, // Active Inquiries အတွက်
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inquiries, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET Inquiries Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 },
      );
    }

    const newInquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        status: 0, // Default PENDING
      },
    });

    return NextResponse.json(
      { message: "Inquiry submitted successfully", newInquiry },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ POST Inquiry Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
