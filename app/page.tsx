"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatInterface from "@/components/ChatInterface";
import { Sun, Moon, ArrowRight, Plane } from "lucide-react";

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Destination data ─── */
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
  { emoji: "🦁", name: "Safari Kenya", tag: "Wildlife & nature" },
  { emoji: "🌊", name: "Andaman", tag: "Snorkeling & coral" },
  { emoji: "🏰", name: "Rajasthan", tag: "Palaces & forts" },
];

const FEATURES = [
  { icon: "✈️", title: "Flights", desc: "Search across all airlines. MakeMyTrip, Skyscanner, Google Flights — all in one place.", teal: false },
  { icon: "🏨", title: "Hotels", desc: "From budget OYO stays to 5-star resorts. Booking.com, Agoda, Hotels.com and more.", teal: true },
  { icon: "🎯", title: "Activities", desc: "Curated tours, experiences, and day trips from Viator and local operators.", teal: false },
  { icon: "🗣️", title: "Conversational", desc: "Just talk. Describe your trip in plain words — WanderAI handles the rest.", teal: true },
  { icon: "🔗", title: "Real Links", desc: "Not just suggestions — actual booking links you can click and purchase directly.", teal: false },
  { icon: "🎙️", title: "Voice Input", desc: "Speak your travel plans. WanderAI listens and responds in natural language.", teal: true },
];

const STEPS = [
  { title: "Tell WanderAI your plan", desc: "Mention your destination, dates, budget, and travel style — in natural conversation." },
  { title: "Get curated options", desc: "WanderAI searches and combines flights, hotels, and activities tailored to you." },
  { title: "Click and book", desc: "Every suggestion comes with real booking links. No copy-pasting, no hassle." },
];

/* ─── Section wrapper with reveal ─── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showApp, setShowApp] = useState(false);
  const [destIdx, setDestIdx] = useState(0);

  /* Apply theme to <html> */
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

  const toggleTheme = useCallback(() => {
    setTheme(t => t === "dark" ? "light" : "dark");
  }, []);

  /* Auto-cycle preview destination */
  useEffect(() => {
    const id = setInterval(() => setDestIdx(i => (i + 1) % DESTINATIONS.length), 3000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  if (showApp) {
    return (
      <main>
        {/* Theme toggle in app too */}
        <div style={{ position: "fixed", top: 0, right: 0, zIndex: 200 }}>
          <button
            className="lp-nav__theme-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            style={{ margin: "14px 14px 0 0", borderRadius: "8px", position: "absolute", right: 0, top: 0 }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
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

      {/* ── Hero ── */}
      <div className="lp-hero">
        <div className="lp-section">
          <div className="lp-hero__inner">
            {/* Left */}
            <div>
              <div className="lp-hero__badge reveal" style={{ transitionDelay: "0s" }}>
                <div className="lp-hero__badge-dot" />
                AI-powered travel planning
              </div>

              <h1 className="lp-hero__title reveal" style={{ transitionDelay: "0.1s" }}>
                Plan your trip<br />
                just by <em>talking</em>
              </h1>

              <p className="lp-hero__desc reveal" style={{ transitionDelay: "0.2s" }}>
                Describe where you want to go. WanderAI finds flights, hotels, and activities — and hands you real booking links, all through natural conversation.
              </p>

              <div className="lp-hero__actions reveal" style={{ transitionDelay: "0.3s" }}>
                <button className="btn-primary" onClick={() => setShowApp(true)}>
                  Start planning free
                  <ArrowRight size={15} />
                </button>
                <button className="btn-secondary" onClick={() => setShowApp(true)}>
                  See how it works
                </button>
              </div>

              <div className="lp-hero__stats stagger reveal" style={{ transitionDelay: "0.4s" }}>
                <div className="lp-hero__stat-item">
                  <span className="lp-hero__stat-num">5 min</span>
                  <span className="lp-hero__stat-label">to a full itinerary</span>
                </div>
                <div className="lp-hero__stat-item">
                  <span className="lp-hero__stat-num">8+</span>
                  <span className="lp-hero__stat-label">booking sites searched</span>
                </div>
                <div className="lp-hero__stat-item">
                  <span className="lp-hero__stat-num">Free</span>
                  <span className="lp-hero__stat-label">no account needed</span>
                </div>
              </div>
            </div>

            {/* Right — Chat preview */}
            <div className="lp-hero__preview reveal-scale" style={{ transitionDelay: "0.2s" }}>
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
                <div className="lp-preview-ai">
                  Where would you like to travel?
                </div>
                <div className="lp-preview-user">
                  {dest.emoji} {dest.name} — {dest.tag}
                </div>
                <div className="lp-preview-ai">
                  Great choice! I&apos;ll find the best flights, hotels, and things to do.
                </div>
                <div className="lp-preview-links">
                  <div className="lp-preview-link"><span>✈️</span> Cheapest flights on Skyscanner</div>
                  <div className="lp-preview-link"><span>🏨</span> Top hotels on Booking.com</div>
                  <div className="lp-preview-link"><span>🎯</span> Activities on Viator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Destinations scrolling strip ── */}
      <div className="lp-destinations">
        <div className="lp-section">
          <Section>
            <div className="lp-section-label">Destinations</div>
            <div className="lp-section-title" style={{ marginBottom: 0 }}>
              Anywhere you want to go
            </div>
          </Section>
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

      {/* ── Features ── */}
      <div className="lp-features">
        <div className="lp-section">
          <Section>
            <div className="lp-section-label">Features</div>
            <div className="lp-section-title">Everything you need to plan a trip</div>
            <p className="lp-section-desc">
              WanderAI handles the research so you can focus on the excitement of travel.
            </p>
          </Section>

          <div className="lp-features-grid stagger">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`lp-feature-card reveal`}
                style={{ transitionDelay: `${i * 0.08}s` }}
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

      {/* ── How it works ── */}
      <div className="lp-how">
        <div className="lp-section">
          <Section>
            <div className="lp-section-label">How it works</div>
            <div className="lp-section-title">Three steps to your perfect trip</div>
          </Section>

          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`lp-step reveal`}
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="lp-step-num">{i + 1}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="lp-section">
        <Section>
          <div className="lp-cta-banner">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
              <Plane size={32} style={{ color: "var(--accent)" }} />
            </div>
            <div className="lp-cta-banner__title">Ready to plan your next adventure?</div>
            <p className="lp-cta-banner__desc">
              No sign-up. No credit card. Just tell WanderAI where you want to go.
            </p>
            <button className="btn-primary" onClick={() => setShowApp(true)} style={{ margin: "0 auto", display: "flex" }}>
              Start planning free <ArrowRight size={15} />
            </button>
          </div>
        </Section>
      </div>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">✈ WanderAI</div>
        <div className="lp-footer__note">Powered by Gemini 2.5 Flash via OpenRouter</div>
        <div className="lp-footer__acc">Free to use · No account needed</div>
      </footer>

      {/* Mount all reveal elements on load */}
      <RevealObserver />
    </main>
  );
}

/* Trigger IntersectionObserver for all .reveal elements on the landing page */
function RevealObserver() {
  useEffect(() => {
    const handleReveal = () => {
      const classes = ["reveal", "reveal-left", "reveal-right", "reveal-scale"];
      const elements = document.querySelectorAll(classes.map(c => `.${c}:not(.visible)`).join(", "));

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );

      elements.forEach(el => obs.observe(el));
      return obs;
    };

    // Small delay so DOM is populated
    const timer = setTimeout(() => {
      const obs = handleReveal();
      return () => obs?.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
