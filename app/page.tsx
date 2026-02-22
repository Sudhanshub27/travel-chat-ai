"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import ChatInterface from "@/components/ChatInterface";
import { Sun, Moon, ArrowRight, Plane } from "lucide-react";

/* ─── Data ─── */
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
  { icon: "🎯", title: "Activities", desc: "Curated tours, day trips, and local experiences with direct booking links from Viator and more.", teal: false },
  { icon: "🗣️", title: "Conversational", desc: "Just describe your trip in plain language — WanderAI handles all the research and planning.", teal: true },
  { icon: "🔗", title: "Real Booking Links", desc: "Not just suggestions — actual links you click to purchase directly. No copy-pasting, no hassle.", teal: false },
  { icon: "🗺️", title: "Itinerary Builder", desc: "Build a day-by-day itinerary as you chat. Add, edit, and export your full trip plan.", teal: true },
];

const STEPS = [
  { title: "Describe your trip", desc: "Tell WanderAI your destination, dates, budget, and style — in natural conversation." },
  { title: "Get curated options", desc: "WanderAI searches flights, hotels, and activities tailored exactly to you." },
  { title: "Book and go", desc: "Every suggestion comes with real booking links. Click and confirm — that's it." },
];

/* ─── Global observer boot (called once after DOM is ready) ─── */
function runObserver() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07, rootMargin: "0px 0px -30px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => obs.observe(el));
  return obs;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showApp, setShowApp] = useState(false);
  const [destIdx, setDestIdx] = useState(0);
  const obsRef = useRef<IntersectionObserver | null>(null);

  /* ── Theme init ── */
  useEffect(() => {
    const saved = localStorage.getItem("wander-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wander-theme", theme);
  }, [theme, mounted]);

  /* ── Global reveal observer — boots once after mount ── */
  useEffect(() => {
    if (!mounted) return;
    // Small RAF delay so the DOM is fully painted before observing
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        obsRef.current?.disconnect();
        obsRef.current = runObserver();
      }, 60);
    });
    return () => { cancelAnimationFrame(raf); obsRef.current?.disconnect(); };
  }, [mounted]);

  /* ── Cycling preview destination ── */
  useEffect(() => {
    const id = setInterval(() => setDestIdx((i) => (i + 1) % DESTINATIONS.length), 3200);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

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

      {/* ══════════════════ NAV ══════════════════ */}
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

      {/* ══════════════════ HERO ══════════════════ */}
      {/* Hero uses CSS keyframe animations — no observer needed */}
      <div className="lp-hero">
        <div className="lp-section">
          <div className="lp-hero__inner">

            {/* Left */}
            <div>
              <div className="lp-hero__badge hero-a1">
                <div className="lp-hero__badge-dot" />
                AI-powered travel planning
              </div>

              <h1 className="lp-hero__title hero-a2">
                Plan your trip<br />just by <em>talking</em>
              </h1>

              <p className="lp-hero__desc hero-a3">
                Describe where you want to go. WanderAI finds flights, hotels, and activities — and hands you real booking links, all through natural conversation.
              </p>

              <div className="lp-hero__actions hero-a4">
                <button className="btn-primary" onClick={() => setShowApp(true)}>
                  Start planning free <ArrowRight size={15} />
                </button>
                <button className="btn-secondary" onClick={() => scrollToSection("how-it-works")}>
                  See how it works
                </button>
              </div>

              <div className="lp-hero__stats hero-a5">
                <div className="lp-hero__stat-item">
                  <span className="lp-hero__stat-num">5 min</span>
                  <span className="lp-hero__stat-label">to a full itinerary</span>
                </div>
                <div className="lp-hero__stat-item">
                  <span className="lp-hero__stat-num">8+</span>
                  <span className="lp-hero__stat-label">booking sites</span>
                </div>
                <div className="lp-hero__stat-item">
                  <span className="lp-hero__stat-num">Free</span>
                  <span className="lp-hero__stat-label">no account needed</span>
                </div>
              </div>
            </div>

            {/* Right — chat preview (CSS anim) */}
            <div className="lp-hero__preview hero-a6">
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
                <div className="lp-preview-user" key={destIdx}>
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

      {/* ══════════════════ DESTINATIONS STRIP ══════════════════ */}
      <div className="lp-destinations">
        <div className="lp-section">
          <div data-reveal style={{ "--reveal-delay": "0s" } as React.CSSProperties}>
            <div className="lp-section-label">Destinations</div>
            <div className="lp-section-title" style={{ marginBottom: 0 }}>
              Anywhere you want to go
            </div>
          </div>
        </div>
        <div style={{ marginTop: "32px", overflow: "hidden" }}>
          <div className="lp-destinations-scroll">
            {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
              <div key={i} className="lp-dest-card" onClick={() => setShowApp(true)}>
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

      {/* ══════════════════ FEATURES ══════════════════ */}
      <div className="lp-features">
        <div className="lp-section">
          {/* Section header */}
          <div data-reveal>
            <div className="lp-section-label">Features</div>
            <div className="lp-section-title">Everything you need to plan a trip</div>
            <p className="lp-section-desc">
              WanderAI handles the research so you can focus on the excitement of travel.
            </p>
          </div>

          {/* Cards — each independently observed */}
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                data-reveal
                className="lp-feature-card"
                style={{ "--reveal-delay": `${i * 0.09}s` } as React.CSSProperties}
              >
                <div className={`lp-feature-icon ${f.teal ? "lp-feature-icon--teal" : ""}`}>
                  {f.icon}
                </div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <div className="lp-how" id="how-it-works">
        <div className="lp-section">
          <div data-reveal>
            <div className="lp-section-label">How it works</div>
            <div className="lp-section-title">Three steps to your perfect trip</div>
          </div>

          <div className="lp-steps" style={{ marginTop: "48px" }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                data-reveal
                className="lp-step"
                style={{ "--reveal-delay": `${i * 0.15}s` } as React.CSSProperties}
              >
                <div className="lp-step-num">{i + 1}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ CTA ══════════════════ */}
      <div className="lp-section">
        <div data-reveal className="lp-cta-banner">
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

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="lp-footer" data-reveal>
        <div className="lp-footer__brand">✈ WanderAI</div>
        <div className="lp-footer__note">Powered by Gemini 2.5 Flash via OpenRouter</div>
        <div className="lp-footer__acc">Free · No account needed</div>
      </footer>

    </main>
  );
}
