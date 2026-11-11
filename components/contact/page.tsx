import { prisma } from "@/lib/prisma";
import ContactClient from "./ContactClient";
import { connection } from "next/server";

export default async function ContactPage() {
  await connection();
  const [rows] = await Promise.all([
    prisma.pageSectionEditable.findMany({
      where: { page: "contact", isActive: true, deletedAt: null },
      include: {
        cards: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  // Decimal / Date မပို့ဘဲ လိုတဲ့ field ကိုပဲ ရွေးပို့မယ်
  const data = rows.map((r) => ({
    id: r.id,
    sectionKey: r.sectionKey,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    imageUrl: r.imageUrl,
    cards: r.cards.map((c) => ({
      id: c.id,
      icon: c.icon,
      title: c.title,
      description: c.description,
      imageUrl: c.imageUrl,
    })),
  }));

  return <ContactClient rows={data} />;
}
