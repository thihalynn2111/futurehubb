import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Role တစ်ခုချင်းစီအတွက် အမှန်ခြစ်ထားသော Permissions များကို ဆွဲထုတ်ရန်
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: parseInt(roleId) },
    });

    return NextResponse.json(rolePermissions);
  } catch (error: any) {
    console.error("GET ROLE PERMISSIONS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch role permissions" },
      { status: 500 },
    );
  }
}

// POST: Checkbox ခြစ်ထားသည်များကို Database ထဲသို့ သိမ်းဆည်းရန်
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roleId, permissionIds } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }

    // ၁။ အရင်ရှိပြီးသား ဒီ Role ရဲ့ Permission များကို အရင်ဖျက်ပါ (Sync လုပ်ရန်)
    await prisma.rolePermission.deleteMany({
      where: { roleId: parseInt(roleId) },
    });

    // ၂။ အသစ် ခြစ်ထားသော Permission ID များကို ထည့်သွင်းပါ
    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
      const dataToInsert = permissionIds.map((permId: number) => ({
        roleId: parseInt(roleId),
        permissionId: permId,
      }));

      await prisma.rolePermission.createMany({
        data: dataToInsert,
      });
    }

    return NextResponse.json(
      { message: "Permissions saved successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("SAVE ROLE PERMISSIONS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save role permissions" },
      { status: 500 },
    );
  }
}
