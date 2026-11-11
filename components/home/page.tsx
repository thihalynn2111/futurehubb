import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const [rows, projects] = await Promise.all([
    prisma.pageSectionEditable.findMany({
      where: { page: "home", isActive: true, deletedAt: null },
      include: {
        cards: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),

    prisma.projects.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
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

  const projectData = projects.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    clientLogo: p.clientLogo,
  }));

  return <HomeClient rows={data} projects={projectData} />;
}
