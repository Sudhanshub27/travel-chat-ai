"use client";

import React from "react";
import { TravelLink } from "@/types/travel";

interface LinkCardsProps {
    links: TravelLink[];
}

const categoryLabels: Record<string, string> = {
    flight: "Flights",
    hotel: "Hotels",
    stay: "Stays",
    activity: "Activities",
    map: "Explore",
};

export default function LinkCards({ links }: LinkCardsProps) {
    if (!links || links.length === 0) return null;

    const grouped = links.reduce((acc, link) => {
        if (!acc[link.category]) acc[link.category] = [];
        acc[link.category].push(link);
        return acc;
    }, {} as Record<string, TravelLink[]>);

    return (
        <div className="link-section">
            {Object.entries(grouped).map(([category, catLinks]) => (
                <div key={category}>
                    <div className="link-section__label">
                        {categoryLabels[category] || category}
                    </div>
                    <div className="link-grid">
                        {catLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-card"
                            >
                                <span className="link-card__icon">{link.icon}</span>
                                <div className="link-card__body">
                                    <span className="link-card__label">{link.label}</span>
                                    {link.description && (
                                        <span className="link-card__desc">{link.description}</span>
                                    )}
                                </div>
                                <span className="link-card__arrow">↗</span>
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
