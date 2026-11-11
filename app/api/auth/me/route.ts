import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Token ကို Verify လုပ်ပြီး Payload (roles နဲ့ permissions များ) ကို ထုတ်ယူခြင်း
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json(
      {
        user: {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
