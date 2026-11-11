import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { inquiryId, toEmail, subject, message } = await req.json();

    if (!toEmail || !message) {
      return NextResponse.json(
        { message: "Recipient email and message are required." },
        { status: 400 },
      );
    }

    // Try sending email via Nodemailer, but catch error so it won't crash the status update
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"FutureHub Admin" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `Re: ${subject || "Inquiry Response"}`,
        text: message,
      });
    } catch (mailErr) {
      console.error(
        "Nodemailer warning (email not sent, but marking resolved):",
        mailErr,
      );
    }

    // Update Inquiry Status to RESOLVED (Status = 1)
    if (inquiryId) {
      await prisma.inquiry.update({
        where: { id: Number(inquiryId) },
        data: { status: 1 }, // 1 = Resolved
      });
    }

    return NextResponse.json(
      { message: "Reply processed and marked as resolved successfully!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error in reply route:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process reply." },
      { status: 500 },
    );
  }
}
