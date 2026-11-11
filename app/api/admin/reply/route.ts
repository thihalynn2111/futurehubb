import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inquiryId, toEmail, email, subject, message } = body;

    const recipientEmail = toEmail || email;

    if (!recipientEmail || !message) {
      return NextResponse.json(
        { message: "Recipient email and message are required" },
        { status: 400 },
      );
    }

    // 1. Nodemailer Transporter (Explicit Host & Port 587 configuration)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 2. Email ပို့ခြင်း
    await transporter.sendMail({
      from: `"FutureHub Support" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject
        ? `RE: ${subject}`
        : "Response to your inquiry - FutureHub",
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #334155;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #0d9488; margin-bottom: 20px;">FutureHub Support Team</h2>
            <p style="font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
            <br/>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #94a3b8;">This is a direct reply from FutureHub Admin.</p>
          </div>
        </div>
      `,
    });

    // 3. Database တွင် Status ကို 1 (Resolved) သို့ ပြောင်းလဲပေးခြင်း
    if (inquiryId) {
      await prisma.inquiry.update({
        where: { id: Number(inquiryId) },
        data: { status: 1 },
      });
    }

    return NextResponse.json(
      { message: "Email sent successfully and inquiry marked as resolved!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
