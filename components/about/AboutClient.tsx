"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CardData = {
  id: number;
  icon: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

type SectionData = {
  id: number;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  cards: CardData[];
};

type TeamMemberData = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
};

function resolveImage(url: string | null, fallback: string) {
  if (!url) return fallback;

  if (url.startsWith("http") || url.startsWith("/")) {
    return encodeURI(url);
  }

  return encodeURI(`/${url}`);
}

export default function AboutClient({
  rows,
  teamMembers,
}: {
  rows: SectionData[];
  teamMembers: TeamMemberData[];
}) {
  const container = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  const hero = rows.find((r) => r.sectionKey === "hero");
  const mission = rows.find((r) => r.sectionKey === "mission");
  const vision = rows.find((r) => r.sectionKey === "vision");
  const why = rows.find((r) => r.sectionKey === "why choose us");

  useGSAP(
    () => {
      // HERO (design only)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-title", { y: -80, opacity: 0, duration: 1 })
        .from(".hero-sub", { x: -100, opacity: 0, duration: 0.8 }, "-=0.5")
        .from(".hero-btn", { x: 100, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(
          ".explore-btn",
          { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(1.7)" },
          "-=0.5",
        );

      // Original label animation (kept)
      gsap.from(".about-label", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });

      // Mission / Vision / Why cards: top, left, right entrance
      const enter = [
        { x: 0, y: -80 },
        { x: -80, y: 0 },
        { x: 80, y: 0 },
      ];
      gsap.utils.toArray<HTMLElement>(".about-card").forEach((el, i) => {
        const s = enter[i % enter.length];
        gsap.from(el, {
          x: s.x,
          y: s.y,
          opacity: 0,
          scale: 0.95,
          duration: 0.9,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        });
      });

      // Team cards: drop in with stagger
      ScrollTrigger.batch(".team-card", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 60, opacity: 0, scale: 0.92 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              stagger: 0.12,
              duration: 0.8,
              ease: "back.out(1.4)",
            },
          ),
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: container },
  );

  return (
    <main ref={container} className="overflow-x-hidden bg-[#04323c]">
      {/* HERO SECTION */}
      {hero && (
        <section
          className="relative flex min-h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          {/* design: overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#04323c]/85 via-[#04323c]/45 to-transparent" />

          <div className="relative ml-8 text-white md:ml-16">
            <h1 className="hero-title text-4xl font-extrabold md:text-6xl">
              {hero.title}
            </h1>

            <p className="hero-sub mt-4 text-lg text-white/80">
              {hero.subtitle}
            </p>

            {hero.description && (
              <Link href="/contact">
                <span className="hero-btn mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-7 py-3 font-semibold text-slate-900 shadow-lg transition hover:scale-105">
                  {hero.description}
                </span>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            aria-label="Explore more"
            className="explore-btn absolute bottom-10 right-6 rounded-full border border-white/30 bg-white/10 px-8 py-6 text-white shadow-xl backdrop-blur-md transition hover:bg-white/25 md:right-10"
          >
            Explore More ↓
          </button>
        </section>
      )}

      {/* MISSION / VISION / WHY CHOOSE US */}
      <section
        id="about"
        ref={aboutRef}
        className="relative bg-gradient-to-br from-[#04323c] via-[#055b66] to-[#0a3f4d] px-6 py-24 text-white"
      >
        {/* design: glows */}
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {/* MISSION */}
          {mission && (
            <div className="about-card group rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)]">
              <h2 className="about-label mb-4 text-2xl font-bold">
                {mission.title}
              </h2>
              <div className="mb-5 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500 group-hover:w-full" />

              {mission.subtitle && (
                <h3 className="mb-3 text-lg font-semibold text-emerald-300">
                  {mission.subtitle}
                </h3>
              )}

              {mission.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={resolveImage(mission.imageUrl, "")}
                    alt="Mission"
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}

              <p className="text-white/70">{mission.description}</p>

              {mission.cards.map((card) => (
                <div
                  key={card.id}
                  className="mt-4 border-t border-white/15 pt-4"
                >
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-white/70">{card.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* VISION */}
          {vision && (
            <div className="about-card group rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)]">
              <h2 className="about-label mb-4 text-2xl font-bold">
                {vision.title}
              </h2>
              <div className="mb-5 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500 group-hover:w-full" />

              {vision.subtitle && (
                <h3 className="mb-3 text-lg font-semibold text-emerald-300">
                  {vision.subtitle}
                </h3>
              )}

              {vision.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={resolveImage(vision.imageUrl, "")}
                    alt="Vision"
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}

              <p className="text-white/70">{vision.description}</p>

              {vision.cards.map((card) => (
                <div
                  key={card.id}
                  className="mt-4 border-t border-white/15 pt-4"
                >
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-white/70">{card.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* WHY CHOOSE US */}
          {why && (
            <div className="about-card group rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)]">
              <h2 className="about-label mb-4 text-2xl font-bold">
                {why.title}
              </h2>
              <div className="mb-5 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500 group-hover:w-full" />

              {why.subtitle && (
                <h3 className="mb-3 text-lg font-semibold text-emerald-300">
                  {why.subtitle}
                </h3>
              )}

              {why.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={resolveImage(why.imageUrl, "")}
                    alt="Why choose us"
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}

              <p className="text-white/70">{why.description}</p>

              {why.cards.map((card) => (
                <div
                  key={card.id}
                  className="mt-4 border-t border-white/15 pt-4"
                >
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-white/70">{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TEAM MEMBER SECTION */}
      <section className="relative bg-gradient-to-b from-[#0a3f4d] to-[#04323c] px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 mt-3 text-4xl font-extrabold md:text-5xl">
            Our Team
          </h2>
          <div className="mx-auto mb-12 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />

          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((person) => (
                <div
                  key={person.id}
                  className="team-card group overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)]"
                >
                  <div className="mx-auto mb-5 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-300 to-emerald-300 p-1">
                    <img
                      src={resolveImage(person.imageUrl, "/default-avatar.png")}
                      alt={person.title}
                      className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="text-xl font-bold">{person.title}</h3>

                  <p className="mt-2 text-emerald-300">{person.subtitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60">No team members available.</p>
          )}
        </div>
      </section>
    </main>
  );
}
