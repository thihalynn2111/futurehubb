import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // "token" အစား Login API တွင် သုံးထားသော "admin_token" ကို ဖျက်ရပါမည်
    cookieStore.set({
      name: "admin_token",
      value: "",
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
