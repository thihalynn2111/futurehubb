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
    <main ref={container} className="bg-white">
      {/* HERO SECTION */}
      {hero && (
        <section
          className="relative flex min-h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="ml-8 md:ml-16 text-white">
            <h1 className="text-4xl font-bold md:text-5xl">{hero.title}</h1>

            <p className="mt-4 text-lg">{hero.subtitle}</p>

            {hero.description && (
              <Link href="/contact">
                <span className="mt-4 inline-block rounded-xl border bg-gray-400 p-3">
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
            className="absolute bottom-10 right-10 rounded-full border border-white/40 bg-white/20 p-8 text-white backdrop-blur-md transition hover:bg-white/30"
          >
            Explore More ↓
          </button>
        </section>
      )}

      {/* MISSION / VISION / WHY CHOOSE US */}
      <section id="about" ref={aboutRef} className="px-6 py-16 text-black">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* MISSION */}
          {mission && (
            <div className="about-card rounded-2xl bg-gray-50 p-8 shadow-md">
              <h2 className="about-label mb-4 text-2xl font-bold">
                {mission.title}
              </h2>

              {mission.subtitle && (
                <h3 className="mb-3 text-lg font-semibold">
                  {mission.subtitle}
                </h3>
              )}

              {mission.imageUrl && (
                <img
                  src={resolveImage(mission.imageUrl, "")}
                  alt="Mission"
                  className="mb-4 h-48 w-full rounded-xl object-cover"
                />
              )}

              <p className="text-gray-600">{mission.description}</p>

              {mission.cards.map((card) => (
                <div key={card.id} className="mt-4 border-t pt-4">
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* VISION */}
          {vision && (
            <div className="about-card rounded-2xl bg-gray-50 p-8 shadow-md">
              <h2 className="about-label mb-4 text-2xl font-bold">
                {vision.title}
              </h2>

              {vision.subtitle && (
                <h3 className="mb-3 text-lg font-semibold">
                  {vision.subtitle}
                </h3>
              )}

              {vision.imageUrl && (
                <img
                  src={resolveImage(vision.imageUrl, "")}
                  alt="Vision"
                  className="mb-4 h-48 w-full rounded-xl object-cover"
                />
              )}

              <p className="text-gray-600">{vision.description}</p>

              {vision.cards.map((card) => (
                <div key={card.id} className="mt-4 border-t pt-4">
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* WHY CHOOSE US */}
          {why && (
            <div className="about-card rounded-2xl bg-gray-50 p-8 shadow-md">
              <h2 className="about-label mb-4 text-2xl font-bold">
                {why.title}
              </h2>

              {why.subtitle && (
                <h3 className="mb-3 text-lg font-semibold">{why.subtitle}</h3>
              )}

              {why.imageUrl && (
                <img
                  src={resolveImage(why.imageUrl, "")}
                  alt="Why choose us"
                  className="mb-4 h-48 w-full rounded-xl object-cover"
                />
              )}

              <p className="text-gray-600">{why.description}</p>

              {why.cards.map((card) => (
                <div key={card.id} className="mt-4 border-t pt-4">
                  <h3 className="font-bold">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TEAM MEMBER SECTION */}
      <section className="px-6 py-16 text-center text-black">
        <h2 className="mb-8 text-4xl font-bold">Our Team</h2>

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((person) => (
              <div
                key={person.id}
                className="overflow-hidden rounded-xl bg-white p-5 shadow-md"
              >
                <img
                  src={resolveImage(person.imageUrl, "/default-avatar.png")}
                  alt={person.title}
                  className="mx-auto mb-4 h-48 w-48 rounded-full object-cover"
                />

                <h3 className="text-xl font-bold">{person.title}</h3>

                <p className="mt-2 text-gray-500">{person.subtitle}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No team members available.</p>
        )}
      </section>
    </main>
  );
}
