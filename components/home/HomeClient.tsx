"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
type ProductCard = {
  id: number;
  icon: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

type LatestProduct = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  category: {
    id: number;
    name: string;
  };
  cards: ProductCard[];
};
function resolveImage(url: string | null, fallback: string) {
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/")) return encodeURI(url);
  return encodeURI(`/${url}`);
}

export default function HomeClient({
  rows,
  projects,
  latestProduct,
}: {
  rows: SectionData[];
  projects: ProjectData[];
  latestProduct: LatestProduct | null;
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
  const contact = rows.find((r) => r.sectionKey === "contact call to action");
  const partner = rows.find((r) => r.sectionKey === "Partner & Project");
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
          duration: 30,
          ease: "none",
          repeat: -1,
          invalidateOnRefresh: true,
        });
      }

      // Tech cards (About card မပါ)
      gsap.from(".tech-grid:not(.about-sub-grid) .tech-card", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".tech-grid:not(.about-sub-grid)",
          start: "top 85%",
          once: true,
        },
      });

      // DESIGN ONLY: section headings + roadmap + partners
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".road-item").forEach((el, i) => {
        gsap.from(el, {
          y: i % 2 === 0 ? -60 : 60,
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          ease: "back.out(1.4)",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      // ---------- About CTA: smooth timeline ----------
      const aboutTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: ".about-main-card",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      aboutTl
        .from(".about-main-card", {
          x: -100,
          opacity: 0,
          duration: 1.3,
          ease: "expo.out",
          immediateRender: false,
        })
        .from(
          ".about-text > *",
          {
            x: 60,
            opacity: 0,
            duration: 1.1,
            stagger: 0.15,
            immediateRender: false,
          },
          "-=0.9",
        );

      gsap.from(".about-sub-card", {
        y: 70,
        opacity: 0,
        duration: 1.2,
        stagger: 0.18,
        ease: "expo.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".about-sub-grid",
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
      // ---------- Contact cards: right -> left, one by one ----------
      gsap.utils.toArray<HTMLElement>(".contact-card").forEach((el) => {
        gsap.fromTo(
          el,
          { x: 150, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: container, dependencies: [rows, projects] },
  );

  // ---------- About card cursor tilt (desktop/mouse only) ----------
  useGSAP(
    () => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
        return;

      const cards = gsap.utils.toArray<HTMLElement>(".about-card");

      const cleanups = cards.map((card) => {
        gsap.set(card, {
          transformPerspective: 1000,
          transformOrigin: "center",
        });

        const rx = gsap.quickTo(card, "rotationX", {
          duration: 0.8,
          ease: "power3.out",
        });
        const ry = gsap.quickTo(card, "rotationY", {
          duration: 0.8,
          ease: "power3.out",
        });

        const onMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          ry(x * 10);
          rx(-y * 10);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        return () => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        };
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: container, dependencies: [rows, projects] },
  );
  // ---------- Latest Product Cards ----------
  const productCards = latestProduct?.cards ?? [];

  const half = Math.ceil(productCards.length / 2);
  const leftCards = productCards.slice(0, half);
  const rightCards = productCards.slice(half);

  const renderFeatureCard = (card: ProductCard) => (
    <div
      key={card.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3 hover:border-teal-500/40 transition"
    >
      {card.imageUrl && (
        <img
          src={resolveImage(card.imageUrl, "")}
          alt={card.title ?? ""}
          className="w-12 h-12 object-cover rounded-lg border border-slate-800"
        />
      )}

      {card.title && (
        <h3 className="text-lg font-bold text-teal-400 underline underline-offset-4 decoration-teal-500/40">
          {card.title}
        </h3>
      )}

      <p className="text-slate-400 text-sm leading-relaxed">
        {card.description || "No additional description."}
      </p>
    </div>
  );
  return (
    <main ref={container} className="overflow-x-hidden bg-[#04323c] text-white">
      {/* ===================== HERO ===================== */}
      {hero && (
        <section
          className="relative flex min-h-screen items-center bg-cover bg-center py-24"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#04323c]/90 via-[#04323c]/60 to-[#04323c]/20 md:from-[#04323c]/85 md:via-[#04323c]/45 md:to-transparent" />

          <div className="relative max-w-2xl px-6 text-white md:ml-16 md:px-0">
            <h1 className="hero-title text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
              {hero.title}
            </h1>
            <p className="hero-description mt-4 text-base text-white/80 sm:text-lg">
              {hero.subtitle}
            </p>
            <br />
            {hero.description && (
              <Link href="/user/contact">
                <button className="rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-105 sm:px-7 sm:text-base">
                  {hero.description}
                </button>
              </Link>
            )}
          </div>

          <div className="explore-btn absolute bottom-6 right-4 sm:bottom-8 sm:right-6 md:bottom-auto md:right-10 md:top-2/3 md:-translate-y-1/2 lg:right-20">
            {" "}
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              aria-label="Explore more"
              className="group relative flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:h-[130px] sm:w-[130px] md:h-[200px] md:w-[200px] lg:h-[250px] lg:w-[250px]"
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
                className="h-[40px] w-[32px] transition-transform duration-300 group-hover:translate-y-2 md:h-[60px] md:w-[48px] lg:h-[75px] lg:w-[60px]"
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
        <section className="overflow-hidden bg-[#04323c] py-12 md:py-16">
          <h2 className="reveal mb-4 px-4 text-center text-2xl font-extrabold sm:text-3xl md:text-4xl">
            Trusted by global companies
          </h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />

          <div className="mt-8 overflow-hidden md:mt-10">
            <div ref={trackRef} className="flex w-max">
              {[0, 1].map((groupIndex) => (
                <div
                  key={groupIndex}
                  className="image-group flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4"
                >
                  {[0, 1, 2, 3].flatMap((repeat) =>
                    projects
                      .filter((p) => p.clientLogo)
                      .map((p) => (
                        <img
                          key={`${groupIndex}-${repeat}-${p.id}`}
                          src={resolveImage(p.clientLogo, "")}
                          alt={p.title ?? "logo"}
                          className="h-24 w-48 shrink-0 rounded-2xl bg-white/90 p-3 object-contain shadow-lg sm:h-32 sm:w-64 md:h-40 md:w-80 md:p-4 "
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
        <section className="relative bg-gradient-to-br from-[#04323c] via-[#055b66] to-[#0a3f4d] px-4 py-16 text-white md:py-24">
          <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl md:h-96 md:w-96" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl md:h-96 md:w-96" />

          <div className="relative mx-auto max-w-6xl space-y-10 md:space-y-12">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
              {about.cards && about.cards[0] && (
                <div
                  key={about.cards[0].id}
                  className="tech-card about-card about-main-card will-change-transform group flex flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/10 p-5 text-center shadow-xl backdrop-blur-md transition-colors duration-500 hover:border-cyan-300/50 sm:p-6 md:col-span-4"
                >
                  {about.cards[0].imageUrl && (
                    <div className="mb-4 w-full overflow-hidden rounded-2xl">
                      <img
                        src={resolveImage(about.cards[0].imageUrl, "")}
                        alt={about.cards[0].title ?? ""}
                        className="h-24 w-24 rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  {about.cards[0].title && (
                    <h3 className="pb-2 text-center text-lg font-semibold">
                      {about.cards[0].title}
                    </h3>
                  )}
                  {about.cards[0].description && (
                    <p className="text-center font-bold leading-7 text-cyan-300">
                      {about.cards[0].description}
                    </p>
                  )}
                </div>
              )}

              <div className="about-text space-y-4 text-center md:col-span-8 md:text-left">
                {about.subtitle && (
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 sm:text-sm">
                    {about.subtitle}
                  </p>
                )}
                <h2 className="text-2xl font-extrabold sm:text-3xl md:text-5xl">
                  {about.title}
                </h2>
                {about.description && (
                  <Link
                    href="/user/about"
                    className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-3 text-center text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-105 sm:px-7 sm:text-base"
                  >
                    {about.description}
                  </Link>
                )}
              </div>
            </div>

            <div className="tech-grid about-sub-grid grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {about.cards &&
                about.cards.slice(1).map((card) => (
                  <div
                    key={card.id}
                    className="tech-card about-card about-sub-card will-change-transform group rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md transition-colors duration-500 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)] sm:p-6"
                  >
                    {card.imageUrl && (
                      <div className="mb-4 overflow-hidden rounded-2xl">
                        <img
                          src={resolveImage(card.imageUrl, "")}
                          alt={card.title ?? ""}
                          className="h-24 w-24 rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    {card.title && (
                      <h3 className="pb-2 text-center text-lg font-semibold">
                        {card.title}
                      </h3>
                    )}
                    {card.description && (
                      <p className="text-center leading-7 text-white/70">
                        {card.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}
      {contact && (
        <section className="relative bg-gradient-to-br from-[#04323c] via-[#055b66] to-[#0a3f4d] px-4 py-16 text-white md:py-24">
          <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl md:h-96 md:w-96" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl md:h-96 md:w-96" />

          <div className="relative mx-auto max-w-6xl space-y-10 md:space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div>
                {contact.subtitle && (
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 sm:text-sm">
                    {contact.subtitle}
                  </p>
                )}
                <h2 className="text-2xl font-extrabold sm:text-3xl md:text-5xl">
                  {contact.title}
                </h2>
                {contact.description && (
                  <Link
                    href="/user/contact"
                    className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-3 text-center text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-105 sm:px-7 sm:text-base"
                  >
                    {contact.description}
                  </Link>
                )}
              </div>
              <div>
                {contact.cards.map((card) => (
                  // အပြင် wrapper = GSAP အတွက်ပဲ (grid မပါရ)
                  <div
                    key={card.id}
                    className="contact-card m-3 will-change-transform mt-6"
                  >
                    {/* အတွင်း card = style + grid အားလုံး ဒီမှာ */}
                    <div
                      className={`group grid w-full grid-cols-1 rounded-l-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)] sm:p-6 ${
                        card.imageUrl ? "md:grid-cols-[30%_70%]" : ""
                      }`}
                    >
                      <div>
                        {card.imageUrl && (
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full">
                            <img
                              src={resolveImage(card.imageUrl, "")}
                              alt={card.title ?? ""}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        )}
                      </div>
                      <div className="md:mt-2">
                        {card.title && (
                          <h3 className="pb-2 text-xl font-semibold sm:text-2xl">
                            {card.title}
                          </h3>
                        )}
                        {card.description && (
                          <p className="leading-7 text-white/70">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= LATEST PRODUCT FEATURES ================= */}
      {latestProduct && latestProduct.cards.length > 0 && (
        <section
          id="latest-product-features"
          className="bg-[#04323c] text-white mx-auto max-w-6xl space-y-12 scroll-mt-24 px-6 py-16"
        >
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-400">
              What's inside
            </p>

            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Features of {latestProduct.title}
            </h2>

            <p className="text-sm leading-relaxed text-slate-400 md:text-base">
              {latestProduct.description ||
                "No description provided for this product."}
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
            {/* Left Cards */}
            <div className="order-2 space-y-6 lg:order-1">
              {leftCards.map(renderFeatureCard)}
            </div>

            {/* Center Product Image */}
            <div className="order-1 flex justify-center lg:order-2">
              <div className="relative aspect-[9/19] w-60 overflow-hidden rounded-[2.5rem] border-[10px] border-slate-700 bg-slate-900 shadow-2xl md:w-64">
                {latestProduct.imageUrl ? (
                  <img
                    src={resolveImage(latestProduct.imageUrl, "")}
                    alt={latestProduct.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center font-bold text-teal-400">
                    {latestProduct.title}
                  </div>
                )}
              </div>
            </div>

            {/* Right Cards */}
            <div className="order-3 space-y-6">
              {rightCards.map(renderFeatureCard)}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TECHNOLOGY ===================== */}
      {tech && (
        <section
          id="about"
          className="bg-[#04323c] px-4 py-16 sm:px-8 md:py-24"
        >
          <h1 className="reveal mb-4 text-center text-3xl font-extrabold md:text-5xl">
            {tech.title}
          </h1>

          <h2
            ref={textRef}
            className="mb-10 bg-[linear-gradient(90deg,#67e8f9_0%,#67e8f9_40%,#ffffff_50%,#6ee7b7_60%,#6ee7b7_100%)] bg-[length:200%_100%] bg-clip-text text-center text-2xl font-bold text-transparent sm:text-3xl md:mb-12 md:text-5xl"
          >
            {tech.subtitle}
          </h2>

          <div className="tech-grid mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tech.cards.map((card) => (
              <div
                key={card.id}
                className="tech-card group rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)] sm:p-6"
              >
                {card.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={resolveImage(card.imageUrl, "")}
                      alt={card.title ?? ""}
                      className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                {card.title && (
                  <h3 className="pb-2 text-center text-xl font-semibold sm:text-2xl">
                    {card.title}
                  </h3>
                )}
                {card.description && (
                  <p className="leading-7 text-white/70">{card.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================== ROADMAP ===================== */}
      {roadmap && (
        <div className="relative bg-gradient-to-b from-[#04323c] to-[#0a3f4d] px-4 py-16 sm:px-6 md:py-24">
          <h2 className="reveal text-center text-2xl font-extrabold sm:text-3xl md:text-5xl">
            {roadmap.title}
          </h2>
          <h1 className="reveal mt-3 text-center text-white/70">
            {roadmap.subtitle}
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />

          <div className="flex flex-col items-center gap-2 py-10 md:flex-row md:items-start md:justify-center md:gap-0 md:overflow-x-auto">
            {roadmap.cards.map((c, index) => (
              <div
                key={c.id}
                className="road-item flex shrink-0 flex-col items-center md:flex-row md:items-start"
              >
                {/* Image and Text */}
                <div className="flex w-full max-w-[220px] flex-col items-center text-center md:w-24 md:max-w-none">
                  <div className="rounded-full bg-gradient-to-br from-cyan-300 to-emerald-300 p-[3px]">
                    <img
                      src={resolveImage(c.imageUrl, "/default-avatar.png")}
                      alt={c.title ?? "Roadmap"}
                      className="h-24 w-24 rounded-full bg-white object-cover"
                    />
                  </div>

                  <h3 className="mt-4 w-full font-semibold md:w-36">
                    {c.title}
                  </h3>
                  <p className="mt-2 w-full text-sm text-white/70 md:w-36">
                    {c.description}
                  </p>
                </div>

                {/* Connector line */}
                {index !== roadmap.cards.length - 1 && (
                  <>
                    <div className="my-4 h-10 border-l-2 border-dotted border-cyan-300/60 md:hidden" />
                    <div className="w-30 mt-12 hidden border-t-2 border-dotted border-cyan-300/60 md:block" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== PARTNERS SLIDER ===================== */}
      {projects.length > 0 && (
        <section className="overflow-hidden bg-[#0a3f4d] px-4 py-16 sm:px-6 md:py-24">
          {partner ? (
            <h2 className="reveal mb-8 text-center text-3xl font-extrabold md:mb-10 md:text-4xl">
              {partner.title}
            </h2>
          ) : (
            <h2 className="reveal mb-8 text-center text-3xl font-extrabold md:mb-10 md:text-4xl">
              Partner and Project
            </h2>
          )}

          <div className="overflow-hidden pt-20">
            <div ref={sliderRef} className="flex gap-6">
              {projects.map((partner) => (
                <div
                  key={partner.id}
                  className="group w-full shrink-0 rounded-3xl border border-white/15 bg-white/10 px-4 pb-6 pt-0 backdrop-blur-md md:w-[calc((100%-4.5rem)/4)] transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.4)]"
                >
                  {partner.clientLogo && (
                    <div className="relative z-10 -mt-16 h-42 overflow-hidden rounded-full ">
                      <img
                        src={resolveImage(partner.clientLogo, "")}
                        alt={partner.title ?? "partner"}
                        className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="mt-4 text-center text-lg font-bold text-white md:text-xl">
                    {partner.title}
                  </h3>
                  <p className="text-center leading-7 text-white/70">
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
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-white backdrop-blur-md transition hover:bg-cyan-300 hover:text-slate-900"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-white backdrop-blur-md transition hover:bg-cyan-300 hover:text-slate-900"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
