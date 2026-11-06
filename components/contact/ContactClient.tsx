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

export default function ContactClient({ rows }: { rows: SectionData[] }) {
  const container = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const position = useRef(0);

  const hero = rows.find((r) => r.sectionKey === "hero");
  const info = rows.find((r) => r.sectionKey === "info");
  const contact = rows.find((r) => r.sectionKey === "contact-box");
  const aboutRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.from(".about-label", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });
    },
    { scope: aboutRef },
  );
  return (
    <main ref={container} className="bg-white">
      {/* ===================== HERO ===================== */}
      {hero && (
        <section
          className="relative flex h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="ml-16 text-white">
            <h1 className="hero-title text-5xl font-bold text-center">
              {hero.title}
            </h1>
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

      {/* ===================== INFO ===================== */}
      {info && (
        <section className="py-12 text-center text-black">
          <div>
            <h2 className="text-center text-4xl">Contact Info</h2>
            <div
              className="grid grid-cols- gap-6 p-4 text-center"
              style={{
                gridTemplateColumns: `repeat(${info.cards.length}, minmax(0, 1fr))`,
              }}
            >
              {info.cards.map((card) => (
                <div
                  className="rounded-xl bg-white p-6 shadow-md"
                  key={card.id}
                >
                  <i className="fa-solid fa-location-crosshairs text-4xl"></i>
                  <br />
                  <h2 className="text-xl font-bold">{card.title}</h2>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== contact box ===================== */}
      {contact && (
        <section ref={aboutRef} id="about" className="py-16 text-black">
          <div className="flex flex-col gap-8 md:flex-row ">
            <div className="w-full p-4 md:w-1/2">
              <img src="/public/uploads/05c581ba-6737-409e-82fb-b4d514f97e6a.jpg" />
            </div>

            <div className="w-full rounded-xl bg-gray-100 p-6 md:w-1/2">
              <h3 className="mb-4 text-xl font-bold">{contact.title}</h3>
              <form>
                <input
                  placeholder="Enter Name"
                  className="border mb-3 rounded-sm p-2 w-full"
                />
                <br />
                <input
                  placeholder="example@gmail.com"
                  className="border mb-3 p-2 w-full rounded-sm"
                />
                <br />
                <input
                  placeholder="Subject............."
                  className="border mb-3 rounded-sm p-2 w-full"
                />
                <br />
                <input
                  placeholder="Text............"
                  className="border mb-3 p-2 w-full"
                />
                <br />
                <button className="border rounded-sm p-2">Submit</button>
              </form>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
