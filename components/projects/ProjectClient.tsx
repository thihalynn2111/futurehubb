"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ProjectData = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  clientLogo: string | null;
};

function resolveImage(url: string | null, fallback: string) {
  if (!url) return fallback;

  if (url.startsWith("http") || url.startsWith("/")) {
    return encodeURI(url);
  }

  return encodeURI(`/${url}`);
}

export default function ProjectClient({ rows }: { rows: ProjectData[] }) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".about-label", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });

      gsap.from(".about-card", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".about-card",
          start: "top 85%",
        },
      });
    },
    { scope: container },
  );

  return (
    <main
      ref={container}
      className="min-h-screen bg-white px-6 py-16 text-black"
    >
      {/* PROJECT HEADING */}
      <h1 className="about-label mb-12 text-center text-4xl font-bold">
        Our Projects
      </h1>

      {/* PROJECT CARDS */}
      {rows.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => (
            <div
              key={project.id}
              className="about-card overflow-hidden rounded-xl bg-white p-6 text-center shadow-md"
            >
              {/* Client Logo */}
              {project.clientLogo && (
                <img
                  src={resolveImage(project.clientLogo, "/default-avatar.png")}
                  alt={`${project.title} logo`}
                  className="mx-auto mb-5 h-40 w-full object-contain"
                />
              )}

              {/* Project Title */}
              <h2 className="mb-3 text-xl font-bold">{project.title}</h2>

              {/* Project Subtitle */}
              {project.subtitle && (
                <p className="mb-3 text-gray-500">{project.subtitle}</p>
              )}

              {/* Project Description */}
              {project.description && (
                <p className="text-sm leading-7 text-gray-600">
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No projects available.</p>
      )}
    </main>
  );
}
