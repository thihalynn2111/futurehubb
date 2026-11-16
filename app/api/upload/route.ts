import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/uploads ဖိုလ်ဒါ ရှိမရှိ စစ်ပြီး မရှိရင် ဆောက်မယ်
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // ဖိုင်နာမည် ထပ်မတူအောင် နာမည်အသစ် ပေးမယ်
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.name.replace(/\s+/g, "-");
    const filepath = path.join(uploadDir, filename);

    // ဖိုင်ကို သိမ်းမယ်
    await writeFile(filepath, buffer);

    // သိမ်းပြီးတဲ့ ဖိုင်ရဲ့ URL ကို ပြန်ပို့မယ်
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
