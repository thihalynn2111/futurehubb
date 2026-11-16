// app/user/home/page.tsx
import { Suspense } from "react";
import HomePage from "@/components/home/page";
import { prisma } from "@/lib/prisma"; // 👈 Database ချိတ်ဆက်ဖို့ Prisma ကို ခေါ်ရပါမယ်

// 🚀 SEO Metadata ကို Database ကနေ ဆွဲထုတ်ပေးမယ့် Function
export async function generateMetadata() {
  try {
    const seo = await prisma.seoPage.findUnique({
      where: { pageName: "home" }, // Admin မှာ "Home Page" ကို ရွေးပြီး သိမ်းထားတဲ့ Data ကို ယူမယ်
    });

    return {
      title: seo?.metaTitle || "FutureHub Myanmar", // Admin မှာ ရေးထားတဲ့ Title၊ မရှိရင် Default
      description: seo?.metaDesc || "Leading web development services...", // Admin မှာ ရေးထားတဲ့ Description
      keywords: seo?.keywords || "web development, futurehub", // Admin မှာ ရေးထားတဲ့ Keywords
    };
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    // Database ချိတ်ဆက်မှု Error တက်ခဲ့ရင် Default ကို ပြန်ပေးမယ်
    return {
      title: "FutureHub Myanmar",
      description: "Leading web development services...",
    };
  }
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
