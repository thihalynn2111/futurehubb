import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

// GET: Permission အားလုံးကို ဆွဲထုတ်ရန် (Trash ထဲရောက်နေသည်များအပါအဝင်)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    // 💡 ဤနေရာတွင် where clause ကို ဖြုတ်လိုက်ပါမှ Trash တွေပါ အတူပါလာမည်
    const permissions = await prisma.permission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(permissions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Permission အသစ် ဖန်တီးရန်
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET);

    const body = await req.json();
    const { name, resource, action, description } = body;

    if (!name || !resource || !action) {
      return NextResponse.json(
        { error: "Name, resource and action are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.permission.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Permission already exists" },
        { status: 400 },
      );
    }

    const newPermission = await prisma.permission.create({
      data: {
        name,
        resource,
        action,
        description: description || null,
      },
    });

    return NextResponse.json(newPermission, { status: 201 });
  } catch (error: any) {
    console.error("Create permission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create permission" },
      { status: 500 },
    );
  }
}
