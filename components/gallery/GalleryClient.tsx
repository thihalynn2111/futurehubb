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

type GalleryData = {
  id: number;
  title: string | null;
  date: Date | null;
  imageUrl: string | null;
};

function resolveImage(url: string | null, fallback: string) {
  if (!url) return fallback;

  if (url.startsWith("http") || url.startsWith("/")) {
    return encodeURI(url);
  }

  return encodeURI(`/${url}`);
}

const ENTER_STYLES = [
  { y: -120, x: 0, rotate: -3 },
  { y: 0, x: -120, rotate: 0 },
  { y: 0, x: 120, rotate: 0 },
  { y: 120, x: 0, rotate: 3 },
];

export default function GalleryClient({
  rows,
  Gallery,
}: {
  rows: SectionData[];
  Gallery: GalleryData[];
}) {
  const container = useRef<HTMLElement>(null);

  const hero = rows.find((r) => r.sectionKey === "hero");
  const header = rows.find((r) => r.sectionKey === "header");

  useGSAP(
    () => {
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-title", { y: -80, opacity: 0, duration: 1 })
          .from(
            ".hero-subtitle",
            { x: -100, opacity: 0, duration: 0.8 },
            "-=0.5",
          )
          .from(".hero-btn", { x: 100, opacity: 0, duration: 0.7 }, "-=0.5");

        gsap.to(".hero-section", {
          backgroundPositionY: "30%",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (header) {
        gsap.from(".header-title, .header-desc", {
          y: -50,
          opacity: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".header-title",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        });
      }

      const items = gsap.utils.toArray<HTMLElement>(".gallery-item");

      items.forEach((el, i) => {
        const style = ENTER_STYLES[i % ENTER_STYLES.length];

        gsap.from(el, {
          x: style.x,
          y: style.y,
          rotate: style.rotate,
          opacity: 0,
          scale: 0.9,
          duration: 0.9,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: container, dependencies: [Gallery.length, !!hero, !!header] },
  );

  return (
    <main ref={container} className="overflow-x-hidden bg-[#04323c] text-white">
      {hero && (
        <section
          className="hero-section relative flex min-h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#04323c]/90 via-[#04323c]/55 to-[#04323c]/10" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04323c] to-transparent" />

          <div className="relative ml-6 max-w-2xl text-white md:ml-16">
            <h1 className="hero-title text-4xl font-extrabold leading-tight md:text-6xl">
              {hero.title}
            </h1>

            <p className="hero-subtitle mt-4 text-lg text-white/80">
              {hero.subtitle}
            </p>

            {hero.description && (
              <Link href="/contact">
                <span className="hero-btn mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-7 py-3 font-semibold text-slate-900 shadow-lg transition-[box-shadow,filter] duration-300 hover:brightness-110 hover:shadow-cyan-300/40">
                  {hero.description}
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="relative bg-gradient-to-b from-[#04323c] via-[#055b66] to-[#0a3f4d] px-6 py-24 text-center">
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {header && (
            <>
              <h2 className="header-title mb-3 text-4xl font-extrabold md:text-5xl">
                {header.title}
              </h2>
              <h3 className="header-title mb-3 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                {header.subtitle}
              </h3>
              <div className="mx-auto mb-5 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
              <p className="header-desc mx-auto max-w-2xl leading-8 text-white/70">
                {header.description}
              </p>
            </>
          )}
          {Gallery.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 mt-12">
              {Gallery.map((img) => (
                <div key={img.id} className="mb-4 break-inside-avoid">
                  <div className="gallery-item group text-left">
                    <div className="overflow-hidden rounded-xl shadow-lg shadow-black/30 transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-cyan-400/40">
                      <img
                        src={resolveImage(img.imageUrl, "/default-avatar.png")}
                        alt={img.title ?? "Gallery image"}
                        onLoad={() => ScrollTrigger.refresh()}
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <h3 className="mt-2 text-lg font-semibold transition-colors duration-300 group-hover:text-cyan-300">
                      {img.title}
                    </h3>

                    <h4 className="text-sm text-cyan-300/80 transition-colors duration-300 group-hover:text-cyan-200">
                      {img.date
                        ? new Date(img.date).toLocaleDateString("en-CA")
                        : ""}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-white/60">No images available.</p>
          )}
        </div>
      </section>
    </main>
  );
}
