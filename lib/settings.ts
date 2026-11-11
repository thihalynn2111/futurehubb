// lib/settings.ts
import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  // Server Component တိုင်းမှာ ဒီတစ်ကြောင်းတည်း လှမ်းခေါ်သုံးရုံပါပဲ
  return await prisma.siteSetting.findFirst();
}
