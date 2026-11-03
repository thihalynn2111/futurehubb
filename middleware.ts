import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login API တွင် သုံးထားသော "admin_token" နှင့် ကိုက်ညီစေရန် ပြင်ဆင်ခြင်း
  const token = request.cookies.get("admin_token")?.value;

  // Admin Login Page သို့ သွားနေလျှင်
  if (pathname === "/admin/login") {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // Token မမှန်ပါက Login Screen တွင် ဆက်ရှိမည်
      }
    }
    return NextResponse.next();
  }

  // Admin Dashboard Route များကို Protection ပေးခြင်း
  // if (pathname.startsWith("/admin")) {
  //   if (!token) {
  //     return NextResponse.redirect(new URL("/admin/login", request.url));
  //   }

  //   try {
  //     await jwtVerify(token, JWT_SECRET);
  //     return NextResponse.next();
  //   } catch {
  //     return NextResponse.redirect(new URL("/admin/login", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
