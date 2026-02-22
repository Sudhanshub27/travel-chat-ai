"use client";

import React, { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";

// Generate random stars
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  }));
}

const STARS = generateStars(80);

const FEATURES = [
  { icon: "✈️", text: "Flights" },
  { icon: "🏨", text: "Hotels" },
  { icon: "🏠", text: "Unique Stays" },
  { icon: "🎯", text: "Activities" },
  { icon: "🗺️", text: "Itineraries" },
  { icon: "🎤", text: "Voice Chat" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show landing for a brief moment, then go to chat
    // Actually, let's just show landing by default and let user click
  }, []);

  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Animated star field */}
      <div className="stars">
        {STARS.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              "--duration": `${star.duration}s`,
              "--delay": `${star.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Gradient blobs */}
      <div style={{
        position: "fixed",
        top: "-20%",
        left: "-10%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,126,248,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "fixed",
        bottom: "-20%",
        right: "-10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {!showApp ? (
        /* Landing Page */
        <div style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Top nav */}
          <nav style={{
            padding: "20px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-glass)",
            backdropFilter: "blur(10px)",
            background: "rgba(7,11,20,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #3b7ef8, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}>
                ✈️
              </div>
              <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }} className="gradient-text">
                WanderAI
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Powered by</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#4285f4" }}>Gemini AI</span>
            </div>
          </nav>

          {/* Hero */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center",
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59,126,248,0.1)",
              border: "1px solid rgba(59,126,248,0.25)",
              borderRadius: "20px",
              padding: "6px 16px",
              marginBottom: "30px",
              fontSize: "13px",
              color: "#93b4fc",
              fontWeight: 500,
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
              AI-Powered Travel Planning
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(42px, 7vw, 80px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "24px",
              maxWidth: "800px",
            }}>
              Plan Your{" "}
              <span className="gradient-text">Dream Trip</span>
              <br />
              Just by{" "}
              <span style={{ color: "#06b6d4" }}>Talking</span>
            </h1>

            <p style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}>
              Tell WanderAI where you want to go. Get personalized flight, hotel, and activity recommendations with <strong style={{ color: "var(--text-primary)" }}>real booking links</strong> — all through natural conversation.
            </p>

            {/* CTA */}
            <button
              onClick={() => setShowApp(true)}
              className="btn-primary"
              style={{
                fontSize: "16px",
                padding: "14px 36px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <span>✈️</span>
              Start Planning for Free
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "2px 8px", fontSize: "13px" }}>→</span>
            </button>

            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              🎤 Voice chat supported &nbsp;•&nbsp; 🔗 Real booking links &nbsp;•&nbsp; 🆓 No signup needed
            </p>

            {/* Features row */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
              marginTop: "60px",
              maxWidth: "600px",
            }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>

            {/* Demo preview */}
            <div style={{
              marginTop: "60px",
              maxWidth: "640px",
              width: "100%",
            }}>
              <div className="glass-card" style={{
                padding: "0",
                overflow: "hidden",
                boxShadow: "0 0 60px rgba(59,126,248,0.1)",
              }}>
                {/* Mock chat preview */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-glass)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #06b6d4, #3b7ef8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>✈️</div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>WanderAI</p>
                    <p style={{ fontSize: "11px", color: "#10b981" }}>● Online</p>
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", marginBottom: "12px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Hey! 👋 I&apos;m WanderAI. Where are you dreaming of going?
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "linear-gradient(135deg, #3b7ef8, #8b5cf6)", borderRadius: "14px 14px 4px 14px", padding: "10px 16px", fontSize: "13px", color: "white", maxWidth: "80%" }}>
                      I want to go to Goa 🏖️ for 5 days, budget trip, 2 people
                    </div>
                  </div>
                  <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px 14px 14px 4px", padding: "12px 16px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Perfect! 🌴 Goa is amazing for a budget trip! Let me find the best deals for you... Here are your options ↓
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["✈️ Flights from ₹2,800", "🏨 Stay from ₹800/night", "🎯 Activities"].map((t, i) => (
                      <span key={i} style={{ fontSize: "11px", background: "rgba(59,126,248,0.1)", border: "1px solid rgba(59,126,248,0.2)", borderRadius: "8px", padding: "4px 10px", color: "#93b4fc" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Chat App */
        <div style={{
          position: "relative",
          zIndex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          maxWidth: "800px",
          margin: "0 auto",
        }}>
          <ChatInterface />
        </div>
      )}
    </main>
  );
}
