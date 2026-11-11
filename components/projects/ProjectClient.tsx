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
  if (url.startsWith("http") || url.startsWith("/")) return encodeURI(url);
  return encodeURI(`/${url}`);
}

// Card တစ်ခုချင်းစီ ဝင်လာမယ့် ဦးတည်ချက် (အလှည့်ကျ)
const ENTER_STYLES = [
  { x: 0, y: -100 }, // အပေါ်က ကျ
  { x: -100, y: 0 }, // ဘယ်က ဝင်
  { x: 100, y: 0 }, // ညာက ဝင်
  { x: 0, y: 100 }, // အောက်က တက်
];

export default function ProjectClient({ rows }: { rows: ProjectData[] }) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // ---------- Heading ----------
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".proj-eyebrow", { y: -30, opacity: 0, duration: 0.6 })
        .from(".proj-heading", { y: 40, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(".proj-line", { scaleX: 0, duration: 0.7 }, "-=0.4");

      // ---------- Cards ----------
      gsap.utils.toArray<HTMLElement>(".proj-card").forEach((card, i) => {
        const s = ENTER_STYLES[i % ENTER_STYLES.length];

        gsap.from(card, {
          x: s.x,
          y: s.y,
          opacity: 0,
          scale: 0.92,
          duration: 0.9,
          ease: "back.out(1.3)",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            // enter, leave, enterBack, leaveBack
            toggleActions: "play reverse play reverse",
          },
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: container, dependencies: [rows.length] },
  );

  return (
    <main
      ref={container}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04323c] via-[#055b66] to-[#0a3f4d] px-6 pb-24 pt-32 text-white"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADING */}
        <div className="mb-16 text-center">
          <h1 className="proj-heading mt-3 text-4xl font-extrabold md:text-6xl">
            Our Projects
          </h1>
          <div className="proj-line mx-auto mt-5 h-1 w-24 origin-center rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
        </div>

        {/* PROJECT CARDS */}
        {rows.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((project, i) => (
              <div
                key={project.id}
                className="proj-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)]"
              >
                {/* Number */}
                <span className="pointer-events-none absolute right-5 top-3 z-10 text-5xl font-black text-white/10">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Logo */}
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-white/90 p-4">
                  {project.clientLogo ? (
                    <img
                      src={resolveImage(
                        project.clientLogo,
                        "/default-avatar.png",
                      )}
                      alt={`${project.title} logo`}
                      onLoad={() => ScrollTrigger.refresh()}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-5xl font-black text-slate-300">
                      {project.title.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="mt-6 text-xl font-bold leading-snug">
                  {project.title}
                </h2>

                {/* Subtitle */}
                {project.subtitle && (
                  <h3 className="mt-2 text-sm font-semibold text-emerald-300">
                    {project.subtitle}
                  </h3>
                )}

                {/* Description */}
                {project.description && (
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-white/70">
                    {project.description}
                  </p>
                )}

                {/* Bottom accent line */}
                <div className="mt-auto pt-6">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/60">No projects available.</p>
        )}
      </div>
    </main>
  );
}
