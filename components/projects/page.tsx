import { prisma } from "@/lib/prisma";
import ProjectClient from "./ProjectClient";
import { connection } from "next/server";

export default async function ProjectPage() {
  await connection();
  try {
    // 1. Get projects from database
    const rows = await prisma.projects.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // 2. Prepare data for frontend
    const data = rows.map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      description: project.description,
      clientLogo: project.clientLogo,
    }));

    // 3. Send data to ProjectClient
    return <ProjectClient rows={data} />;
  } catch (error) {
    console.error("Error fetching projects:", error);

    throw new Error("Failed to load project data");
  }
}
