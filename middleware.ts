import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;

  // 1. Admin Login Page သို့ သွားနေလျှင်
  if (pathname === "/admin/login") {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // Token မမှန်ပါက Login Page တွင် ဆက်ရှိမည်
      }
    }
    return NextResponse.next();
  }

  // 2. Admin Dashboard Route များကို စစ်ဆေးခြင်း
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const roles = (payload.roles as string[]) || [];
      const permissions = (payload.permissions as string[]) || [];

      // SUPER_ADMIN ဖြစ်ပါက အားလုံးဝင်ခွင့်ရှိသည်
      if (roles.includes("SUPER_ADMIN") || roles.includes("super_admin")) {
        return NextResponse.next();
      }

      const segments = pathname.split("/").filter(Boolean);
      let resource = segments[1]; // ဥပမာ - products, posts, inquiries စသည်ဖြင့်

      if (!resource) {
        return NextResponse.next();
      }

      // 🔗 URL Resource နဲ့ Database Permission Resource နာမည် မတူတာများကို Map လုပ်ပေးခြင်း
      if (resource === "products") {
        resource = "posts"; // URL က products ဆိုရင် DB ထဲက posts နဲ့ တိုက်စစ်မည်
      }

      let requiredAction = "read";
      const subActionOrId = segments[2];

      if (subActionOrId === "create" || pathname.includes("/create")) {
        requiredAction = "create";
      } else if (
        subActionOrId === "edit" ||
        pathname.includes("/edit") ||
        pathname.includes("/update")
      ) {
        requiredAction = "update";
      }

      const requiredPermission = `${resource}:${requiredAction}`;

      const hasPermission =
        permissions.includes(requiredPermission) ||
        permissions.includes(`${resource}:read`);

      if (!hasPermission) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware token verification error:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
