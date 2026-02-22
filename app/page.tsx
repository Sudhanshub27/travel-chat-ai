"use client";

import React, { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";

const FEATURES = [
  { icon: "✈️", text: "Flights" },
  { icon: "🏨", text: "Hotels" },
  { icon: "🏠", text: "Unique Stays" },
  { icon: "🎯", text: "Activities" },
  { icon: "🗺️", text: "Itineraries" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (showApp) {
    return (
      <main>
        <div className="app-shell">
          <ChatInterface />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="landing">
        {/* Nav */}
        <nav className="landing-nav">
          <div className="landing-nav__brand">
            <div className="landing-nav__brand-icon">✈</div>
            WanderAI
          </div>
          <span className="landing-nav__tag">Powered by Gemini 2.5 Flash</span>
        </nav>

        {/* Hero */}
        <section className="landing-hero">
          <div className="landing-badge">
            <div className="status-dot" />
            AI Travel Assistant
          </div>

          <h1 className="landing-hero__title">
            Plan your trip<br />just by <em>talking</em>
          </h1>

          <p className="landing-hero__desc">
            Describe where you want to go. WanderAI finds flights, hotels, and activities — and hands you real booking links, all through natural conversation.
          </p>

          <button className="landing-cta" onClick={() => setShowApp(true)}>
            Start planning
            <span style={{ opacity: 0.7, fontSize: "16px" }}>→</span>
          </button>

          <p className="landing-note">No account needed · Free to use</p>

          {/* Feature pills */}
          <div className="landing-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-pill">
                <span>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          {/* Preview widget */}
          <div className="landing-preview">
            <div className="preview-header">
              <div className="preview-avatar">✈</div>
              <div>
                <div className="preview-title">WanderAI</div>
                <div className="preview-status">● Online</div>
              </div>
            </div>
            <div className="preview-body">
              <div className="preview-ai-msg">
                Hey! Where are you thinking of traveling next?
              </div>
              <div className="preview-user-msg">
                Goa for 5 days, 2 people, budget trip
              </div>
              <div className="preview-ai-msg">
                Great choice. I&apos;ll find budget flights, stays, and things to do in Goa for two.
              </div>
              <div className="preview-tags">
                {["✈️ Flights from ₹2,800", "🏨 Stay from ₹800/night", "🎯 Activities"].map((t, i) => (
                  <span key={i} className="preview-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
