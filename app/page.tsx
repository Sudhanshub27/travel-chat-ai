"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInterface from "@/components/ChatInterface";
import { Sun, Moon, ArrowRight, Plane } from "lucide-react";

/* ─── Typed counter animation ─── */
function useCounter(target: number, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const id = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setVal(Math.round(current));
      if (step >= steps) clearInterval(id);
    }, duration / steps);
    return () => clearInterval(id);
  }, [target, duration, start]);
  return val;
}

/* ─── Reveal hook (single element) ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Destinations ─── */
const DESTINATIONS = [
  { emoji: "🏖️", name: "Goa", tag: "Beach & nightlife" },
  { emoji: "🗼", name: "Paris", tag: "Romance & culture" },
  { emoji: "🏔️", name: "Ladakh", tag: "Adventure & trek" },
  { emoji: "🌴", name: "Bali", tag: "Tropical escape" },
  { emoji: "🕌", name: "Dubai", tag: "Luxury & shopping" },
  { emoji: "🌸", name: "Kyoto", tag: "Tradition & zen" },
  { emoji: "🏝️", name: "Maldives", tag: "Overwater villas" },
  { emoji: "🎭", name: "Istanbul", tag: "History & culture" },
  { emoji: "🏔️", name: "Switzerland", tag: "Alps & skiing" },
  { emoji: "🦁", name: "Kenya Safari", tag: "Wildlife & nature" },
  { emoji: "🌊", name: "Andaman", tag: "Snorkeling & coral" },
  { emoji: "🏰", name: "Rajasthan", tag: "Palaces & forts" },
];

const FEATURES = [
  { icon: "✈️", title: "Flights", desc: "Compare all airlines instantly. Google Flights, Skyscanner, MakeMyTrip, Goibibo — all in one place.", teal: false },
  { icon: "🏨", title: "Hotels", desc: "From budget OYO stays to luxury resorts. 8+ booking sites searched in seconds.", teal: true },
  { icon: "🎯", title: "Activities", desc: "Curated tours, day trips, and local experiences with direct booking links.", teal: false },
  { icon: "🗣️", title: "Conversational", desc: "Just describe your trip in plain language — WanderAI handles all the research.", teal: true },
  { icon: "🔗", title: "Real Booking Links", desc: "Not just suggestions — actual links you click to purchase directly. No copy-pasting.", teal: false },
  { icon: "🗺️", title: "Itinerary Builder", desc: "Build a day-by-day itinerary as you chat. Add, edit, and export your full trip plan.", teal: true },
];

const STEPS = [
  { title: "Describe your trip", desc: "Tell WanderAI your destination, dates, budget, and travel style — in natural conversation." },
  { title: "Get curated options", desc: "WanderAI searches flights, hotels, and activities tailored exactly to you." },
  { title: "Book and go", desc: "Every suggestion comes with real booking links. Click and confirm — that's it." },
];

/* ─── Animated stat item ─── */
function StatItem({ num, suffix, label, animate }: { num: number; suffix: string; label: string; animate: boolean }) {
  const val = useCounter(num, 1200, animate);
  return (
    <div className="lp-hero__stat-item">
      <span className="lp-hero__stat-num">{val}{suffix}</span>
      <span className="lp-hero__stat-label">{label}</span>
    </div>
  );
}

/* ─── Feature card with reveal ─── */
function FeatureCard({ icon, title, desc, teal, delay }: {
  icon: string; title: string; desc: string; teal: boolean; delay: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className="lp-feature-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      <div className={`lp-feature-icon ${teal ? "lp-feature-icon--teal" : ""}`}>{icon}</div>
      <div className="lp-feature-title">{title}</div>
      <div className="lp-feature-desc">{desc}</div>
    </div>
  );
}

/* ─── Step card with reveal ─── */
function StepCard({ num, title, desc, delay }: { num: number; title: string; desc: string; delay: number }) {
  const { ref, visible } = useReveal(0.15);
  return (
    <div
      ref={ref}
      className="lp-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      <div className="lp-step-num">{num}</div>
      <div className="lp-step-title">{title}</div>
      <div className="lp-step-desc">{desc}</div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showApp, setShowApp] = useState(false);
  const [destIdx, setDestIdx] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wander-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
    setMounted(true);
    // Trigger hero animations after a tick
    requestAnimationFrame(() => setTimeout(() => setHeroVisible(true), 80));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wander-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  useEffect(() => {
    const id = setInterval(() => setDestIdx(i => (i + 1) % DESTINATIONS.length), 3200);
    return () => clearInterval(id);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Stats reveal ── */
  const { ref: statsRef, visible: statsVisible } = useReveal(0.3);

  /* ── CTA banner reveal ── */
  const { ref: ctaRef, visible: ctaVisible } = useReveal(0.2);

  if (!mounted) return null;

  if (showApp) {
    return (
      <main>
        <button
          className="lp-nav__theme-btn"
          onClick={toggleTheme}
          title="Toggle theme"
          style={{ position: "fixed", top: 14, right: 14, zIndex: 200 }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="app-shell">
          <ChatInterface />
        </div>
      </main>
    );
  }

  const dest = DESTINATIONS[destIdx];

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav className="lp-nav">
        <div className="lp-nav__brand">
          <div className="lp-nav__icon">✈</div>
          WanderAI
        </div>
        <div className="lp-nav__actions">
          <button className="lp-nav__theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="lp-nav__cta" onClick={() => setShowApp(true)}>
            Start planning
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════
                HERO
            ══════════════════════════════ */}
      <div className="lp-hero">
        <div className="lp-section">
          <div className="lp-hero__inner">

            {/* Left content */}
            <div>
              <div
                className="lp-hero__badge"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(14px)",
                  transition: "opacity 0.5s ease 0s, transform 0.5s ease 0s",
                }}
              >
                <div className="lp-hero__badge-dot" />
                AI-powered travel planning
              </div>

              <h1
                className="lp-hero__title"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s",
                }}
              >
                Plan your trip<br />
                just by <em>talking</em>
              </h1>

              <p
                className="lp-hero__desc"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(18px)",
                  transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
              >
                Describe where you want to go. WanderAI finds flights, hotels, and activities — and hands you real booking links, all through natural conversation.
              </p>

              <div
                className="lp-hero__actions"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
                }}
              >
                <button className="btn-primary" onClick={() => setShowApp(true)}>
                  Start planning free <ArrowRight size={15} />
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  See how it works
                </button>
              </div>

              {/* Stats */}
              <div
                ref={statsRef}
                className="lp-hero__stats"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transition: "opacity 0.5s ease 0.45s",
                }}
              >
                <StatItem num={5} suffix=" min" label="to a full itinerary" animate={statsVisible} />
                <StatItem num={8} suffix="+" label="booking sites" animate={statsVisible} />
                <StatItem num={0} suffix="₹ cost" label="free to use" animate={false} />
              </div>
            </div>

            {/* Right — Chat preview */}
            <div
              className="lp-hero__preview"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
                transition: "opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s",
              }}
            >
              <div className="lp-preview-header">
                <div className="lp-preview-avatar">✈</div>
                <div>
                  <div className="lp-preview-name">WanderAI</div>
                  <div className="lp-preview-status">
                    <div className="lp-preview-dot" /> Online
                  </div>
                </div>
              </div>
              <div className="lp-preview-body">
                <div className="lp-preview-ai">Where would you like to travel?</div>
                <div
                  className="lp-preview-user"
                  style={{ transition: "opacity 0.4s ease" }}
                >
                  {dest.emoji} {dest.name} — {dest.tag}
                </div>
                <div className="lp-preview-ai">
                  Great choice! Here&apos;s what I found for your trip.
                </div>
                <div className="lp-preview-links">
                  <div className="lp-preview-link"><span>✈️</span> Best flights on Skyscanner</div>
                  <div className="lp-preview-link"><span>🏨</span> Hotels on Booking.com & OYO</div>
                  <div className="lp-preview-link"><span>🗺️</span> Day-by-day itinerary</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
                DESTINATIONS STRIP
            ══════════════════════════════ */}
      <div className="lp-destinations">
        <div className="lp-section">
          <div
            style={{
              opacity: 0,
              animation: "lp-fade-up 0.55s ease 0.1s forwards",
            }}
          >
            <div className="lp-section-label">Destinations</div>
            <div className="lp-section-title" style={{ marginBottom: 0 }}>
              Anywhere you want to go
            </div>
          </div>
        </div>
        <div style={{ marginTop: "32px", overflow: "hidden" }}>
          <div className="lp-destinations-scroll">
            {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
              <div
                key={i}
                className="lp-dest-card"
                onClick={() => setShowApp(true)}
              >
                <span className="lp-dest-emoji">{d.emoji}</span>
                <div>
                  <div className="lp-dest-name">{d.name}</div>
                  <div className="lp-dest-tag">{d.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
                FEATURES
            ══════════════════════════════ */}
      <div className="lp-features">
        <div className="lp-section">
          <SectionHeader
            label="Features"
            title="Everything you need to plan a trip"
            desc="WanderAI handles the research so you can focus on the excitement of travel."
          />
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
                HOW IT WORKS
            ══════════════════════════════ */}
      <div className="lp-how" id="how-it-works">
        <div className="lp-section">
          <SectionHeader
            label="How it works"
            title="Three steps to your perfect trip"
          />
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <StepCard key={i} num={i + 1} {...s} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
                CTA BANNER
            ══════════════════════════════ */}
      <div className="lp-section">
        <div
          ref={ctaRef}
          className="lp-cta-banner"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <Plane size={30} style={{ color: "var(--accent)" }} />
          </div>
          <div className="lp-cta-banner__title">Ready to plan your next adventure?</div>
          <p className="lp-cta-banner__desc">
            No sign-up. No credit card. Just tell WanderAI where you want to go.
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowApp(true)}
            style={{ margin: "0 auto", display: "flex" }}
          >
            Start planning free <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">✈ WanderAI</div>
        <div className="lp-footer__note">Powered by Gemini 2.5 Flash via OpenRouter</div>
        <div className="lp-footer__acc">Free · No account needed</div>
      </footer>
    </main>
  );
}

/* ─── Reusable section header with reveal ─── */
function SectionHeader({ label, title, desc }: { label: string; title: string; desc?: string }) {
  const { ref, visible } = useReveal(0.2);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
        marginBottom: desc ? "0" : "40px",
      }}
    >
      <div className="lp-section-label">{label}</div>
      <div className="lp-section-title">{title}</div>
      {desc && <p className="lp-section-desc">{desc}</p>}
    </div>
  );
}
