import { prisma } from "@/lib/prisma";
import GalleryClient from "./GalleryClient";

export default async function AboutPage() {
  try {
    const [rows, images] = await Promise.all([
      prisma.pageSectionEditable.findMany({
        where: {
          page: "gallerySection",
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

      prisma.gallery.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          date: "asc",
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
    const image = images.map((img) => ({
      id: img.id,
      title: img.title,
      date: img.date,
      imageUrl: img.imageUrl,
    }));

    return <GalleryClient rows={data} Gallery={image} />;
  } catch (error) {
    console.error("Error fetching About page:", error);

    throw new Error("Failed to load About page data");
  }
}
