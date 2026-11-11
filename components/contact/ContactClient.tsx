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
        setSuccessMsg("Your message has been sent to Admin successfully! ✅");
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
      {/* {info && (
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
      )} */}

      {/* ===================== contact box ===================== */}
      {/* {contact && (
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
      )} */}

      {/*new design */}
      <div className="grid md:grid-cols-2 text-black gap-2 mt-12 grid-cols-1">
        <div className="rounded shadow-sm m-4 p-5 text-center">
          {info && (
            <section ref={aboutRef} id="about" className=" text-teal-800 py-3">
              <h1 className="text-2xl mb-3 font-bold ">{info.title}</h1>
              <p>{info.subtitle}</p>
              <div className="grid grid-cols-2 gap-5 p-3">
                {info.cards.map((card) => (
                  <div key={card.id}>
                    <div className="grid grid-cols-[20%_80%] mt-4 mb-6">
                      <div className="mr-2">
                        <img
                          src={card.imageUrl ?? "/default-image.png"}
                          alt={card.title || "Card image"}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{card.title}</h2>
                        <p>{card.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className=" ml-4 mb-5">
          {contact && (
            <section ref={aboutRef} id="about" className=" text-black">
              {/* <div > */}
              {/* <div className="w-full p-4 md:w-1/2">
                  <img
                    src={
                      contact.imageUrl ??
                      "/public/uploads/05c581ba-6737-409e-82fb-b4d514f97e6a.jpg"
                    }
                  />
                </div> */}

              <div className="rounded-xl bg-teal-100 mt-3 p-6 md:p-8">
                <div className="min-h-screen bg-teal-100 text-white flex items-center justify-center p-6">
                  <main className="w-full max-w-2xl">
                    <div className="bg-slate-800/30  rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                      <div>
                        <h1 className="text-2xl font-extrabold text-white">
                          {/* 📬 Contact Admin (Inquiry Form) */}
                          {contact.title}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                          {contact.subtitle}
                        </p>
                      </div>

                      {successMsg && (
                        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-3 rounded-xl text-sm font-semibold">
                          {successMsg}
                        </div>
                      )}

                      <form
                        onSubmit={handleSubmitInquiry}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="john@example.com"
                              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+959..."
                              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1">
                              Subject
                            </label>
                            <input
                              type="text"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              placeholder="Inquiry about..."
                              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-1">
                            Message *
                          </label>
                          <textarea
                            rows={4}
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-white placeholder-slate-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                        >
                          {loading ? "Sending..." : "🚀 Send Message to Admin"}
                        </button>
                      </form>
                    </div>
                  </main>
                </div>
              </div>
              {/* </div> */}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
