import { prisma } from "@/lib/prisma";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  try {
    const [rows, members] = await Promise.all([
      prisma.pageSectionEditable.findMany({
        where: {
          page: "about",
          isActive: true,
          deletedAt: null,
        },
        include: {
          cards: {
            where: {
              isActive: true,
              deletedAt: null,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.teamMember.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          sortOrder: "asc",
        },
      }),
    ]);

    // About section data
    const data = rows.map((section) => ({
      id: section.id,
      sectionKey: section.sectionKey,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      imageUrl: section.imageUrl,

      cards: section.cards.map((card) => ({
        id: card.id,
        icon: card.icon,
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl,
      })),
    }));

    // Team member data
    const teamData = members.map((member) => ({
      id: member.id,
      title: member.name,
      subtitle: member.position,
      imageUrl: member.imageUrl,
    }));

    return <AboutClient rows={data} teamMembers={teamData} />;
  } catch (error) {
    console.error("Error fetching About page:", error);

    throw new Error("Failed to load About page data");
  }
}
