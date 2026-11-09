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

export default function GalleryClient({
  rows,
  Gallery,
}: {
  rows: SectionData[];
  Gallery: GalleryData[];
}) {
  const container = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  const hero = rows.find((r) => r.sectionKey === "hero");
  const header = rows.find((r) => r.sectionKey === "header");

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
        </section>
      )}
      {header && (
        <section className="px-6 py-16 text-center text-black">
          <h2 className="mb-8 text-4xl font-bold">{header.title}</h2>
          <h3 className="mb-8 text-4xl font-bold">{header.subtitle}</h3>
          <p>{header.description}</p>
          {Gallery.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Gallery.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-xl bg-white p-5 shadow-md"
                >
                  <img
                    src={resolveImage(img.imageUrl, "/default-avatar.png")}
                    alt=""
                    className="mx-auto mb-4 h-48 w-48  object-cover"
                  />

                  <h3 className="text-xl font-bold">{img.title}</h3>
                  <h4>
                    {img.date
                      ? new Date(img.date).toLocaleDateString("en-CA")
                      : ""}
                  </h4>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members available.</p>
          )}
        </section>
      )}
    </main>
  );
}
