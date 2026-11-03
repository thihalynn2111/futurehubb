import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries, { status: 200 });
  } catch (error: any) {
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
