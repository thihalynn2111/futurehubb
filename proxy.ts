import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-change-it",
);

export async function proxy(request: NextRequest) {
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

      // Role များကို lowercase ဖြင့် စစ်ဆေးခြင်း
      const lowerRoles = roles.map((r) => r.toLowerCase());

      const isSuperOrAdmin = lowerRoles.some(
        (r) =>
          r === "super_admin" ||
          r === "super-admin" ||
          r === "admin" ||
          r === "system",
      );

      if (isSuperOrAdmin || permissions.includes("*")) {
        return NextResponse.next();
      }

      const segments = pathname.split("/").filter(Boolean);
      let rawResource = segments[1]; // ဥပမာ - site-settings, products စသည်ဖြင့်

      // အကယ်၍ /admin သို့မဟုတ် resource မပါသော sub-routes များဖြစ်ပါက အလွယ်တကူ ခွင့်ပြုမည်
      if (!rawResource) {
        return NextResponse.next();
      }

      const resource = rawResource.replace(/-/g, "_").toLowerCase();
      const lowerPerms = permissions.map((p) => p.toLowerCase());

      let requiredAction = "read";
      const subActionOrId = segments[2];

      if (subActionOrId === "create" || pathname.includes("/create")) {
        requiredAction = "create";
      } else if (
        subActionOrId === "edit" ||
        subActionOrId === "update" ||
        pathname.includes("/edit") ||
        pathname.includes("/update")
      ) {
        requiredAction = "update";
      }

      // လိုအပ်သော Permission ပုံစံများ
      const p1 = `${resource}:${requiredAction}`;
      const p2 = `${rawResource}:${requiredAction}`;
      const p3 = `${resource}:read`;
      const p4 = `${rawResource}:read`;
      const p5 = `${resource}:*`;
      const p6 = `${rawResource}:*`;

      const hasPermission =
        lowerPerms.includes(p1) ||
        lowerPerms.includes(p2) ||
        lowerPerms.includes(p3) ||
        lowerPerms.includes(p4) ||
        lowerPerms.includes(p5) ||
        lowerPerms.includes(p6) ||
        lowerPerms.includes("*");

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
