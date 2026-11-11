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

// ပုံတစ်ခုချင်းစီအတွက် ဝင်လာမယ့် ပုံစံကို အစီအစဉ်အတိုင်း လည်ပတ်ပေးမယ်
const ENTER_STYLES = [
  { y: -120, x: 0, rotate: -3 }, // အပေါ်က ကျ (drop down)
  { y: 0, x: -120, rotate: 0 }, // ဘယ်ဘက်က ဝင်
  { y: 0, x: 120, rotate: 0 }, // ညာဘက်က ဝင်
  { y: 120, x: 0, rotate: 3 }, // အောက်က တက်
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
      // ---------- HERO (refresh လုပ်တိုင်း ကစား) ----------
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-title", { y: -80, opacity: 0, duration: 1 }) // အပေါ်က ကျ
          .from(
            ".hero-subtitle",
            { x: -100, opacity: 0, duration: 0.8 },
            "-=0.5",
          ) // ဘယ်က ဝင်
          .from(".hero-btn", { x: 100, opacity: 0, duration: 0.7 }, "-=0.5"); // ညာက ဝင်

        // Hero background parallax
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

      // ---------- HEADER TEXT (အတက်/အဆင်း ပြန်ကစား) ----------
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

      // ---------- GALLERY ITEMS ----------
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
            // enter, leave, enterBack, leaveBack
            toggleActions: "play reverse play reverse",
          },
        });
      });

      // ပုံတွေ အားလုံး load ပြီးမှ trigger နေရာ ပြန်တွက်
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: container, dependencies: [Gallery.length, !!hero, !!header] },
  );

  return (
    <main ref={container} className="overflow-x-hidden bg-[#04323c] text-white">
      {/* HERO SECTION */}
      {hero && (
        <section
          className="hero-section relative flex min-h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="ml-8 md:ml-16 text-white">
            <h1 className="hero-title text-4xl font-bold md:text-5xl">
              {hero.title}
            </h1>

            <p className="hero-subtitle mt-4 text-lg">{hero.subtitle}</p>

            {hero.description && (
              <Link href="/contact">
                <span className="hero-btn mt-4 inline-block rounded-xl border bg-gray-400 p-3 transition hover:bg-gray-500">
                  {hero.description}
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* HEADER + GALLERY */}
      {header && (
        <section className="px-6 py-16 text-center ">
          <h2 className="header-title mb-3 text-4xl font-bold">
            {header.title}
          </h2>
          <h3 className="header-title mb-3 text-4xl font-bold">
            {header.subtitle}
          </h3>
          <p className="header-desc">{header.description}</p>

          {Gallery.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 mt-5">
              {Gallery.map((img) => (
                <div key={img.id} className="mb-4 break-inside-avoid">
                  <div className="gallery-item">
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={resolveImage(img.imageUrl, "/default-avatar.png")}
                        alt={img.title ?? "Gallery image"}
                        onLoad={() => ScrollTrigger.refresh()}
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <h3 className="mt-2 text-lg font-semibold">{img.title}</h3>

                    <h4 className="text-sm text-gray-500">
                      {img.date
                        ? new Date(img.date).toLocaleDateString("en-CA")
                        : ""}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No images available.</p>
          )}
        </section>
      )}
    </main>
  );
}
