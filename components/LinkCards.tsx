"use client";

import React from "react";
import { TravelLink } from "@/types/travel";

const categoryColors: Record<string, string> = {
    flight: "rgba(59,130,246,0.15)",
    hotel: "rgba(139,92,246,0.15)",
    stay: "rgba(16,185,129,0.15)",
    activity: "rgba(245,158,11,0.15)",
    map: "rgba(6,182,212,0.15)",
};

const categoryBorders: Record<string, string> = {
    flight: "rgba(59,130,246,0.35)",
    hotel: "rgba(139,92,246,0.35)",
    stay: "rgba(16,185,129,0.35)",
    activity: "rgba(245,158,11,0.35)",
    map: "rgba(6,182,212,0.35)",
};

interface LinkCardsProps {
    links: TravelLink[];
}

export default function LinkCards({ links }: LinkCardsProps) {
    if (!links || links.length === 0) return null;

    const grouped = links.reduce((acc, link) => {
        if (!acc[link.category]) acc[link.category] = [];
        acc[link.category].push(link);
        return acc;
    }, {} as Record<string, TravelLink[]>);

    const categoryTitles: Record<string, string> = {
        flight: "✈️ Flights",
        hotel: "🏨 Hotels",
        stay: "🏠 Unique Stays",
        activity: "🎯 Activities",
        map: "🗺️ Explore",
    };

    return (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(grouped).map(([category, catLinks]) => (
                <div key={category}>
                    <p style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "6px"
                    }}>
                        {categoryTitles[category] || category}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {catLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-card"
                                style={{
                                    background: categoryColors[link.category] || "var(--bg-glass)",
                                    borderColor: categoryBorders[link.category] || "var(--border-glass)",
                                }}
                            >
                                <span style={{ fontSize: "20px", flexShrink: 0 }}>{link.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1px" }}>
                                        {link.label}
                                    </p>
                                    {link.description && (
                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {link.description}
                                        </p>
                                    )}
                                </div>
                                <span style={{ color: "var(--text-muted)", fontSize: "16px", flexShrink: 0 }}>↗</span>
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
