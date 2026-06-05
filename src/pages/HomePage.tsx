import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gamepad2,
  Laptop,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Swords,
  Volume2,
  VolumeX,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import type { HomeSection, Product } from "../types";

type HomePageProps = {
  products: Product[];
  sections: HomeSection[];
  onAddToCart: (product: Product) => void;
};

const CATEGORY_CARDS = [
  {
    key: "PlayStation",
    label: "PlayStation",
    description: "Consoles, bundles, and official accessories.",
    icon: Monitor,
    shopValue: "PlayStation",
  },
  {
    key: "Controllers",
    label: "Controllers",
    description: "DualSense, DualShock, and gaming controllers.",
    icon: Gamepad2,
    shopValue: "Controllers",
  },
  {
    key: "Laptop",
    label: "Laptop",
    description: "Gaming laptops and portable performance rigs.",
    icon: Laptop,
    shopValue: "Laptop",
  },
  {
    key: "Games",
    label: "Games",
    description: "Physical and digital titles for every platform.",
    icon: Swords,
    shopValue: "Games",
  },
];

const REPAIR_VIDEO_SRC = "/assets/category%20cardvid.MP4";

const REPAIR_STATS = [
  { value: "2-4", label: "day turnaround" },
  { value: "90", label: "day warranty" },
  { value: "100%", label: "quote before work" },
];

const REPAIR_SERVICES = [
  "PS5 / PS4 HDMI, power and display faults",
  "Controller drift, button and charging repairs",
  "Thermal cleaning, fan noise and overheating fixes",
  "Gaming laptop SSD, battery and cooling service",
];

const REPAIR_STEPS = [
  { title: "Diagnose", text: "Hardware check, thermal inspection and clear fault report." },
  { title: "Approve", text: "You receive the repair quote before any paid work starts." },
  { title: "Repair", text: "Parts, testing and WhatsApp updates until pickup or courier handoff." },
];

function ScrollPlayRepairVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleRef = useRef(false);
  const userInteractedRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    function markUserInteracted() {
      userInteractedRef.current = true;
      const video = videoRef.current;

      if (visibleRef.current && video) {
        video.muted = false;
        video.volume = 1;
        setIsMuted(false);
        setHasStarted(true);
        video.play().catch(() => undefined);
      }
    }

    window.addEventListener("pointerdown", markUserInteracted);
    window.addEventListener("keydown", markUserInteracted);
    window.addEventListener("touchstart", markUserInteracted, { passive: true });
    window.addEventListener("wheel", markUserInteracted, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", markUserInteracted);
      window.removeEventListener("keydown", markUserInteracted);
      window.removeEventListener("touchstart", markUserInteracted);
      window.removeEventListener("wheel", markUserInteracted);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    async function playVideo(withSound: boolean) {
      if (!video || cancelled) return;

      video.muted = !withSound;
      video.volume = 1;
      setIsMuted(!withSound);
      try {
        await video.play();
        if (!cancelled) {
          setHasStarted(true);
        }
      } catch {
        if (!withSound || cancelled) return;

        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => undefined);
        if (!cancelled) {
          setHasStarted(true);
        }
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visibleRef.current = true;
          setIsVisible(true);
          playVideo(true);
        } else {
          visibleRef.current = false;
          setIsVisible(false);
          video.pause();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(video);

    return () => {
      cancelled = true;
      observer.disconnect();
      video.pause();
    };
  }, []);

  async function toggleSound() {
    const video = videoRef.current;
    if (!video) return;

    userInteractedRef.current = true;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    video.volume = 1;
    setIsMuted(nextMuted);
    await video.play().catch(() => undefined);
    setHasStarted(true);
  }

  const SoundIcon = isMuted ? Volume2 : VolumeX;
  const soundLabel = isMuted ? "Unmute" : "Mute";

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={REPAIR_VIDEO_SRC}
        loop
        playsInline
        preload="metadata"
      />
      {hasStarted && isVisible ? (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm hover:bg-black/90 transition-colors duration-200"
          style={{ right: "16px", top: "16px" }}
          aria-label={`${soundLabel} repair video`}
        >
          <SoundIcon className="h-4 w-4" />
          {soundLabel}
        </button>
      ) : null}
    </div>
  );
}

export function HomePage({ products, sections, onAddToCart }: HomePageProps) {
  return (
    <div className="bg-bg text-text">
      {/* ── Hero ── */}
      <section className="hero-section relative overflow-hidden border-b border-border">
        <div className="hero-overlay absolute inset-0" />
        <div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-28 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left: text */}
            <div className="space-y-5">
              <p className="text-[10px] uppercase tracking-[0.4em] text-textMuted">
                Home — Premium PlayStation Hardware
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance">
                PlayStation.lk
              </h1>
              <p className="text-sm sm:text-base text-textMuted max-w-md">
                Sri Lanka&apos;s definitive authority for authentic PlayStation consoles, controllers,
                games, and expert repair services.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-md bg-text text-bg px-5 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-90 transition-opacity duration-200"
                >
                  Shop Hardware
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/repairs"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-textMuted hover:text-text transition-colors duration-200"
                >
                  Book Repair
                </Link>
              </div>
            </div>

            {/* Right: image */}
            <div className="rounded-xl border border-border bg-card p-3 backdrop-blur-sm">
              <img
                src="/assets/hero-ps5.jpg"
                alt="PlayStation 5 DualSense Controllers"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: "300px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category cards ── */}
      <section className="section-pad">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_CARDS.map(({ key, label, description, icon: Icon, shopValue }) => (
              <Link
                key={key}
                to={`/shop?category=${encodeURIComponent(shopValue)}`}
                className="group rounded-xl border border-border bg-bgSubtle p-5 hover:bg-card hover:border-accent transition-all duration-200 block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="cat-icon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-textMuted">Category</p>
                </div>
                <p className="text-xl font-semibold text-text group-hover:text-accent transition-colors duration-200">
                  {label}
                </p>
                <p className="mt-2 text-xs text-textMuted">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dynamic product sections ── */}
      {sections
        .filter((section) => section.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => {
          const sectionProducts = section.productIds
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p));

          if (sectionProducts.length === 0) return null;

          return (
            <section key={section.id} className="section-pad border-t border-border">
              <div className="container mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-textMuted">
                    {section.title}
                  </p>
                  <p className="text-xs text-textMuted">{section.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {sectionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

      {/* ── Repair CTA ── */}
      <section className="section-pad border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-border bg-card p-6 h-full">
              <div className="flex h-full flex-col" style={{ gap: "28px" }}>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-textMuted">
                    Repairs, refined
                  </p>
                  <h2 className="text-2xl font-semibold">PlayStation Repairs</h2>
                  <p className="text-sm text-textMuted" style={{ maxWidth: "620px" }}>
                    Certified technicians, genuine parts, and same-week turnarounds for consoles,
                    controllers, and gaming laptops.
                  </p>
                </div>

                <div
                  className="border border-border"
                  style={{
                    borderRadius: "14px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    overflow: "hidden",
                  }}
                >
                  {REPAIR_STATS.map((stat, index) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: "16px",
                        borderLeft: index === 0 ? "0" : "1px solid var(--color-border)",
                      }}
                    >
                      <p className="text-xl font-semibold">{stat.value}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-textMuted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: "18px" }} className="lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: "14px" }}>
                      <Wrench className="h-4 w-4 text-accent" />
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                        What we handle
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {REPAIR_SERVICES.map((service) => (
                        <div key={service} className="flex items-start gap-2">
                          <CheckCircle2
                            className="text-accent"
                            style={{ width: "15px", height: "15px", marginTop: "2px", flexShrink: 0 }}
                          />
                          <p className="text-sm text-textMuted">{service}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: "14px" }}>
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                        Service flow
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {REPAIR_STEPS.map((step, index) => (
                        <div key={step.title} className="flex gap-3">
                          <span
                            className="border border-border text-text"
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "999px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{step.title}</p>
                            <p className="text-xs text-textMuted">{step.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="border-t border-border"
                  style={{
                    marginTop: "auto",
                    paddingTop: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="bg-accentSoft text-accent"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Live repair updates</p>
                      <p className="text-xs text-textMuted">
                        Drop-off or courier handoff, tracked over WhatsApp.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/repairs"
                    className="inline-flex items-center gap-2 rounded-md bg-text text-bg px-5 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-90 transition-opacity duration-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Book repair
                  </Link>
                </div>
              </div>
            </article>
            <div className="rounded-xl border border-border overflow-hidden">
              <ScrollPlayRepairVideo />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
