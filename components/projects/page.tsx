import { prisma } from "@/lib/prisma";
import ProjectClient from "./ProjectClient";
import { connection } from "next/server";

export default async function ProjectPage() {
  await connection();
  try {
    const [page, rows] = await Promise.all([
      prisma.pageSectionEditable.findMany({
        where: { page: "projectSection", isActive: true, deletedAt: null },
      }),
      // 1. Get projects from database
      prisma.projects.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          sortOrder: "asc",
        },
      }),
    ]);

    // 2. Prepare data for frontend
    const data = rows.map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      description: project.description,
      clientLogo: project.clientLogo,
    }));
    const pageData = page.map((r) => ({
      id: r.id,
      sectionKey: r.sectionKey,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
      imageUrl: r.imageUrl,
    }));
    // 3. Send data to ProjectClient
    return <ProjectClient rows={data} page={pageData} />;
  } catch (error) {
    console.error("Error fetching projects:", error);

    throw new Error("Failed to load project data");
  }
}
