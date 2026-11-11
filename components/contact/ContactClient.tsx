"use client";

import { useRef, useState } from "react";
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

function resolveImage(url: string | null, fallback: string) {
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/")) return encodeURI(url);
  return encodeURI(`/${url}`);
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:-translate-y-0.5 focus:border-cyan-300/60 focus:bg-white/10 focus:shadow-[0_8px_30px_-8px_rgba(34,211,238,0.5)] focus:ring-2 focus:ring-cyan-300/30";

export default function ContactClient({ rows }: { rows: SectionData[] }) {
  const container = useRef<HTMLElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const hero = rows.find((r) => r.sectionKey === "hero");
  const info = rows.find((r) => r.sectionKey === "info");
  const contact = rows.find((r) => r.sectionKey === "contact-box");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      if (res.ok) {
        setSuccessMsg("Your message has been sent successfully! ✅");
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Form card: tilt + spotlight ----------
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = formCardRef.current;
    const glow = glowRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = (x / rect.width - 0.5) * 10;
    const rotateX = (0.5 - y / rect.height) * 10;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 900,
      duration: 0.4,
      ease: "power2.out",
    });

    if (glow) {
      gsap.to(glow, {
        x: x - 150,
        y: y - 150,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleCardLeave = () => {
    gsap.to(formCardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)",
    });
    gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
  };

  // ---------- Magnetic button ----------
  const handleBtnMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = submitRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);

    gsap.to(btn, {
      x: dx * 0.15,
      y: dy * 0.35,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleBtnLeave = () => {
    gsap.to(submitRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  useGSAP(
    () => {
      // HERO
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-title", { y: -80, opacity: 0, duration: 1 })
          .from(
            ".hero-description",
            { x: -100, opacity: 0, duration: 0.8 },
            "-=0.5",
          )
          .from(".hero-btn", { x: 100, opacity: 0, duration: 0.7 }, "-=0.5")
          .from(
            ".explore-btn",
            { scale: 0.5, opacity: 0, duration: 0.8, ease: "back.out(1.7)" },
            "-=0.6",
          );

        gsap.to(".circle-text", {
          rotate: 360,
          duration: 20,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });
      }

      // INFO (ဘယ်က ဝင်)
      gsap.from(".info-panel", {
        x: -100,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".info-panel",
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        },
      });

      // FORM (ညာက ဝင်)
      gsap.from(".form-panel", {
        x: 100,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".form-panel",
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: container, dependencies: [!!hero, !!info, !!contact] },
  );

  return (
    <main ref={container} className="overflow-x-hidden bg-[#04323c]">
      {/* ===================== HERO ===================== */}
      {hero && (
        <section
          className="relative flex min-h-screen items-center bg-cover bg-center"
          style={{
            backgroundImage: `url('${resolveImage(hero.imageUrl, "/bg.png")}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#04323c]/80 via-[#04323c]/40 to-transparent" />

          <div className="relative ml-8 max-w-2xl text-white md:ml-16">
            <h1 className="hero-title text-4xl font-extrabold md:text-6xl">
              {hero.title}
            </h1>
            <p className="hero-description mt-4 text-lg text-white/80">
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

          <div className="explore-btn absolute bottom-10 right-6 md:bottom-auto md:right-20 md:top-2/3 md:-translate-y-1/2">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("contact-info")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              aria-label="Explore more"
              className="group relative flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-white/25 md:h-[250px] md:w-[250px]"
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
                className="h-[50px] w-[40px] transition-transform duration-300 group-hover:translate-y-2 md:h-[75px] md:w-[60px]"
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

      {/* ===================== INFO + FORM ===================== */}
      <section className="relative bg-gradient-to-br from-[#04323c] via-[#055b66] to-[#0a3f4d] px-6 py-24 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2">
          {/* ---------- INFO ---------- */}
          {info && (
            <div id="contact-info" className="info-panel">
              <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
                {info.title}
              </h1>
              <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
              {info.subtitle && (
                <p className="mt-5 leading-8 text-white/70">{info.subtitle}</p>
              )}

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {info.cards.map((card) => (
                  <div
                    key={card.id}
                    className="info-item flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/90">
                      <img
                        src={resolveImage(card.imageUrl, "/default-image.png")}
                        alt={card.title || "Card image"}
                        onLoad={() => ScrollTrigger.refresh()}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold">{card.title}</h2>
                      <p className="mt-1 break-words text-sm leading-6 text-white/70">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- FORM ---------- */}
          {contact && (
            <div id="contact-form" className="form-panel">
              <div
                ref={formCardRef}
                onMouseMove={handleCardMove}
                onMouseLeave={handleCardLeave}
                className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-md will-change-transform md:p-10"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Spotlight glow */}
                <div
                  ref={glowRef}
                  className="pointer-events-none absolute left-0 top-0 h-[300px] w-[300px] rounded-full bg-cyan-300/25 opacity-0 blur-3xl"
                />

                <div className="relative">
                  <h2 className="text-2xl font-extrabold">{contact.title}</h2>
                  {contact.subtitle && (
                    <p className="mt-1 text-sm text-white/60">
                      {contact.subtitle}
                    </p>
                  )}

                  {successMsg && (
                    <div className="mt-6 rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                      {successMsg}
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmitInquiry}
                    className="mt-6 space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-white/80">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-white/80">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-white/80">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+959..."
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-white/80">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Inquiry about..."
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-white/80">
                        Message *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className={inputClass}
                      />
                    </div>

                    <button
                      ref={submitRef}
                      type="submit"
                      disabled={loading}
                      onMouseMove={handleBtnMove}
                      onMouseLeave={handleBtnLeave}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-emerald-300 py-3 font-bold text-slate-900 shadow-lg transition-shadow hover:shadow-cyan-300/40 disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "🚀 Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
