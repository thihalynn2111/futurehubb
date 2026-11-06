"use client";

import { useRef, useEffect } from "react";
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

type ProjectData = {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  clientLogo: string | null;
};

function resolveImage(url: string | null, fallback: string) {
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/")) return encodeURI(url);
  return encodeURI(`/${url}`);
}

export default function HomeClient({
  rows,
  projects,
}: {
  rows: SectionData[];
  projects: ProjectData[];
}) {
  const container = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const position = useRef(0);

  const hero = rows.find((r) => r.sectionKey === "hero");
  const tech = rows.find((r) => r.sectionKey === "Technology");
  const roadmap = rows.find((r) => r.sectionKey === "roadmap");
  const about = rows.find((r) => r.sectionKey === "about call to action");

  // ---------- Partner slider ----------
  const slideTo = (direction: 1 | -1) => {
    const slider = sliderRef.current;
    if (!slider || slider.children.length === 0) return;

    const card = slider.children[0] as HTMLElement;
    const gap = 24;
    const visibleCards = window.innerWidth < 768 ? 1 : 3;
    const maxPosition = Math.max(projects.length - visibleCards, 0);

    if (direction === 1) {
      position.current =
        position.current >= maxPosition ? 0 : position.current + 1;
    } else {
      position.current =
        position.current <= 0 ? maxPosition : position.current - 1;
    }

    gsap.to(slider, {
      x: -(position.current * (card.offsetWidth + gap)),
      duration: 0.7,
      ease: "power2.inOut",
    });
  };

  const next = () => slideTo(1);
  const previous = () => slideTo(-1);

  // ---------- Gradient text shimmer ----------
  useEffect(() => {
    if (!textRef.current) return;
    const animation = gsap.fromTo(
      textRef.current,
      { backgroundPosition: "100% 50%" },
      { backgroundPosition: "0% 50%", duration: 10, repeat: -1, ease: "none" },
    );
    return () => {
      animation.kill();
    };
  }, [tech]);

  // ---------- Main animations ----------
  useGSAP(
    () => {
      gsap.from(".hero-title", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });

      gsap.to(".circle-text", {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      gsap.from(".hero-description", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5,
      });
      gsap.from(".explore-btn", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        delay: 0.8,
      });

      // Infinite logo loop
      const track = trackRef.current;
      const group = track?.querySelector<HTMLElement>(".image-group");
      if (track && group) {
        gsap.to(track, {
          x: () => -group.offsetWidth,
          duration: 15,
          ease: "none",
          repeat: -1,
          invalidateOnRefresh: true,
        });
      }

      // Tech cards
      gsap.from(".tech-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".tech-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: container, dependencies: [rows, projects] },
  );

  return (
    <main ref={container}>
      {/* ===================== HERO ===================== */}
      {hero && (
        <section
          className="relative flex h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="ml-16 text-white">
            <h1 className="hero-title text-5xl font-bold">{hero.title}</h1>
            <p className="hero-description mt-4 text-lg">{hero.subtitle}</p>
            <br />
            {hero.description && (
              <Link href="/contact">
                <button className="rounded-xl border bg-gray-400 p-3">
                  {hero.description}
                </button>
              </Link>
            )}
          </div>

          <div className="explore-btn absolute right-20 top-2/3 -translate-y-1/2">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              aria-label="Explore more"
              className="group relative flex h-[250px] w-[250px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-white/30"
            >
              <svg
                viewBox="0 0 250 250"
                className="circle-text absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="circlePath"
                    d="M 125,125 m -87,0 a 87,87 0 1,1 174,0 a 87,87 0 1,1 -174,0"
                  />
                </defs>
                <text
                  fill="currentColor"
                  fontSize="19"
                  fontWeight="600"
                  letterSpacing="1"
                >
                  <textPath
                    href="#circlePath"
                    textLength="546"
                    lengthAdjust="spacing"
                  >
                    Explore More ✳ Explore More ✳ Explore More ✳
                  </textPath>
                </text>
              </svg>

              <svg
                viewBox="0 0 64 80"
                className="h-[75px] w-[60px] transition-transform duration-300 group-hover:translate-y-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M32 3 V65" />
                <path d="M8 47 L32 71 L56 47" />
              </svg>
            </button>
          </div>
        </section>
      )}

      {/* ===================== LOGO LOOP ===================== */}
      {projects.length > 0 && (
        <section className="overflow-hidden py-8">
          <h2 className="mb-4 text-center text-4xl">
            Trusted by global companies
          </h2>

          <div className="mt-10 overflow-hidden">
            <div ref={trackRef} className="flex w-max">
              {[0, 1].map((groupIndex) => (
                <div
                  key={groupIndex}
                  className="image-group flex shrink-0 gap-4 pr-4"
                >
                  {[0, 1, 2, 3].flatMap((repeat) =>
                    projects
                      .filter((p) => p.clientLogo)
                      .map((p) => (
                        <img
                          key={`${groupIndex}-${repeat}-${p.id}`}
                          src={resolveImage(p.clientLogo, "")}
                          alt={p.title ?? "logo"}
                          className="h-40 w-80 shrink-0 rounded-xl object-contain"
                        />
                      )),
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== ABOUT CALL TO ACTION ===================== */}
      {about && (
        <section className="py-12 text-center">
          {about.subtitle && (
            <p className="text-sm uppercase tracking-widest text-teal-700">
              {about.subtitle}
            </p>
          )}
          <h2 className="mt-2 text-3xl font-bold">{about.title}</h2>
          {about.description && (
            <Link href="/about">
              <button className="mt-6 rounded-xl bg-teal-700 px-6 py-3 text-white">
                {about.description}
              </button>
            </Link>
          )}
        </section>
      )}

      {/* ===================== TECHNOLOGY ===================== */}
      {tech && (
        <section id="about" className="px-8 py-16">
          <h1 className="mb-4 text-center text-4xl">{tech.title}</h1>

          <h2
            ref={textRef}
            className="mb-10 bg-[linear-gradient(90deg,#8b929e_0%,#8b929e_40%,#ffffff_50%,#8b929e_60%,#8b929e_100%)] bg-[length:200%_100%] bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl"
          >
            {tech.subtitle}
          </h2>

          <div className="tech-grid grid grid-cols-1 gap-6 md:grid-cols-3">
            {tech.cards.map((card) => (
              <div
                key={card.id}
                className="tech-card rounded-2xl border p-6 shadow"
              >
                {card.imageUrl && (
                  <img
                    src={resolveImage(card.imageUrl, "")}
                    alt={card.title ?? ""}
                    className="mb-4 h-40 w-full rounded-xl object-cover"
                  />
                )}
                {card.title && (
                  <h3 className="pb-2 text-center text-2xl">{card.title}</h3>
                )}
                {card.description && (
                  <p className="leading-7 text-gray-600">{card.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================== ROADMAP ===================== */}
      {roadmap && (
        <section className="px-8 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="mb-6 text-3xl font-bold">{roadmap.title}</h2>
              <p className="mt-4 text-gray-600">{roadmap.subtitle}</p>
            </div>

            <div className="space-y-4">
              {roadmap.cards.map((c) => (
                <div key={c.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-gray-600">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== PARTNERS SLIDER ===================== */}
      {projects.length > 0 && (
        <section className="overflow-hidden px-6 py-16">
          <h2 className="mb-10 text-center text-4xl font-bold">Our Partners</h2>

          <div className="overflow-hidden">
            <div ref={sliderRef} className="flex gap-6">
              {projects.map((partner) => (
                <div
                  key={partner.id}
                  className="w-full shrink-0 rounded-xl bg-white p-6 shadow-lg md:w-[calc((100%-3rem)/3)]"
                >
                  {partner.clientLogo && (
                    <img
                      src={resolveImage(partner.clientLogo, "")}
                      alt={partner.title ?? "partner"}
                      className="mx-auto mb-4 h-40 w-full rounded-xl object-contain"
                    />
                  )}
                  <h3 className="mb-3 text-center text-xl font-bold text-gray-900">
                    {partner.title}
                  </h3>
                  <p className="text-center leading-7 text-gray-600">
                    {partner.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous"
              className="rounded-lg bg-gray-200 px-5 py-2 hover:bg-gray-300"
            >
              <i className="fa-solid fa-less-than"></i>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="rounded-lg bg-gray-200 px-5 py-2 hover:bg-gray-300"
            >
              <i className="fa-solid fa-greater-than"></i>
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
