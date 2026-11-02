import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Browser မှ URL ဖြင့် တိုက်ရိုက်ဝင်ခွင့် (GET)
export async function GET() {
  return handleSeeding();
}

// POST request ဖြင့် ဝင်ခွင့် (POST)
export async function POST() {
  return handleSeeding();
}

async function handleSeeding() {
  try {
    const resources = [
      "posts",
      "projects",
      "roles",
      "users",
      "inquiries",
      "site_settings",
    ];
    const actions = ["create", "read", "update", "delete"];

    let count = 0;

    for (const res of resources) {
      for (const act of actions) {
        const permName = `${res}:${act}`;
        const description = `${res.toUpperCase()} များကို ${act} လုပ်ခွင့်`;

        await prisma.permission.upsert({
          where: { name: permName },
          update: {},
          create: {
            name: permName,
            resource: res,
            action: act,
            description: description,
          },
        });
        count++;
      }
    }

    return NextResponse.json(
      { message: `${count} permissions seeded successfully! ✅` },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("SEED PERMISSIONS ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
