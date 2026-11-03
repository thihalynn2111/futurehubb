import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
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

    // 1. User ကို Database တွင် ရှာဖွေခြင်း (Roles & Permissions များပါ ဆွဲထုတ်မည်)
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

    // 2. Password စစ်ဆေးခြင်း
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။" },
        { status: 401 },
      );
    }

    // 3. User ၏ Roles နှင့် Permissions များကို စုစည်းခြင်း
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    // 4. JWT Token ထုတ်ယူခြင်း
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

    // 5. Response တွင် HTTP-Only Cookie အဖြစ် သိမ်းဆည်းခြင်း
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
      maxAge: 86400, // 1 day
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
