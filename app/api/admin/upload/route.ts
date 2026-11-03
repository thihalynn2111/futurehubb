import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image" },
        { status: 400 },
      );
    }

    // Check image type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Unsupported image format" },
        { status: 400 },
      );
    }

    // Maximum size: 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 5 MB" },
        { status: 400 },
      );
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDirectory, { recursive: true });

    const extension = path.extname(file.name).toLowerCase();
    const fileName = `${randomUUID()}${extension}`;

    const filePath = path.join(uploadDirectory, fileName);

    const bytes = await file.arrayBuffer();

    await writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      imageUrl: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Image upload failed" },
      { status: 500 },
    );
  }
}
