import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email နှင့် Password ထည့်သွင်းရန် လိုအပ်ပါသည်။" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။" },
        { status: 401 },
      );
    }

    // 🚀 BANNED / DELETED စစ်ဆေးခြင်း
    if (user.status !== 1 || user.deletedAt !== null) {
      return NextResponse.json(
        { message: "သင့်အကောင့်ကို ပိတ်ထားပါသည်။ Admin ထံ ဆက်သွယ်ပါ။" },
        { status: 403 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။" },
        { status: 401 },
      );
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap(
          (ur) => ur.role.permissions?.map((rp) => rp.permission.name) || [],
        ),
      ),
    );

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: "Login အောင်မြင်ပါသည်။",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server အတွင်း အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။" },
      { status: 500 },
    );
  }
}
