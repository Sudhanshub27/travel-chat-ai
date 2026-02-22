"use client";

import React, { useState } from "react";
import { Itinerary, ItineraryDay, ItineraryActivity, ActivityType } from "@/types/travel";
import { Plus, Trash2, ExternalLink, Copy, Check, X, ChevronDown, ChevronUp } from "lucide-react";

/* ── Activity type config ── */
const ACTIVITY_ICONS: Record<ActivityType, string> = {
    flight: "✈️",
    hotel: "🏨",
    food: "🍽️",
    activity: "🎯",
    transport: "🚗",
    note: "📝",
};
const ACTIVITY_LABELS: Record<ActivityType, string> = {
    flight: "Flight",
    hotel: "Hotel / Stay",
    food: "Food & Dining",
    activity: "Activity",
    transport: "Transport",
    note: "Note",
};
const ACTIVITY_TYPES: ActivityType[] = ["flight", "hotel", "food", "activity", "transport", "note"];

/* ── Helpers ── */
function uid() { return Math.random().toString(36).slice(2, 9); }

function itineraryToText(itin: Itinerary): string {
    const header = itin.destination ? `🗺️ Trip to ${itin.destination}\n${"─".repeat(30)}\n\n` : "";
    const body = itin.days.map(day => {
        const title = `Day ${day.day}${day.label ? ` — ${day.label}` : ""}`;
        const items = day.activities.map(a =>
            `  ${ACTIVITY_ICONS[a.type]} ${a.time ? `[${a.time}] ` : ""}${a.title}${a.description ? `\n     ${a.description}` : ""}${a.link ? `\n     🔗 ${a.link}` : ""}`
        ).join("\n");
        return `${title}\n${items || "  (No activities yet)"}`;
    }).join("\n\n");
    return header + body;
}

interface ItineraryBuilderProps {
    itinerary: Itinerary;
    onChange: (itin: Itinerary) => void;
    onClose: () => void;
}

export default function ItineraryBuilder({ itinerary, onChange, onClose }: ItineraryBuilderProps) {
    const [copied, setCopied] = useState(false);
    const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
    const [addingActivity, setAddingActivity] = useState<{ dayId: string } | null>(null);
    const [newActivity, setNewActivity] = useState<Partial<ItineraryActivity>>({ type: "activity" });

    /* ── Day actions ── */
    const addDay = () => {
        const nextDay = (itinerary.days.at(-1)?.day ?? 0) + 1;
        onChange({
            ...itinerary,
            days: [...itinerary.days, { id: uid(), day: nextDay, activities: [] }],
        });
    };

    const removeDay = (dayId: string) => {
        onChange({ ...itinerary, days: itinerary.days.filter(d => d.id !== dayId) });
    };

    const updateDayLabel = (dayId: string, label: string) => {
        onChange({
            ...itinerary,
            days: itinerary.days.map(d => d.id === dayId ? { ...d, label } : d),
        });
    };

    const toggleCollapse = (dayId: string) => {
        setCollapsedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
    };

    /* ── Activity actions ── */
    const startAddActivity = (dayId: string) => {
        setAddingActivity({ dayId });
        setNewActivity({ type: "activity" });
    };

    const saveActivity = () => {
        if (!addingActivity || !newActivity.title?.trim()) return;
        const activity: ItineraryActivity = {
            id: uid(),
            type: newActivity.type ?? "activity",
            title: newActivity.title!.trim(),
            time: newActivity.time?.trim() || undefined,
            description: newActivity.description?.trim() || undefined,
            link: newActivity.link?.trim() || undefined,
        };
        onChange({
            ...itinerary,
            days: itinerary.days.map(d =>
                d.id === addingActivity.dayId
                    ? { ...d, activities: [...d.activities, activity] }
                    : d
            ),
        });
        setAddingActivity(null);
        setNewActivity({ type: "activity" });
    };

    const removeActivity = (dayId: string, actId: string) => {
        onChange({
            ...itinerary,
            days: itinerary.days.map(d =>
                d.id === dayId
                    ? { ...d, activities: d.activities.filter(a => a.id !== actId) }
                    : d
            ),
        });
    };

    /* ── Export ── */
    const copyToClipboard = () => {
        navigator.clipboard.writeText(itineraryToText(itinerary)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const totalActivities = itinerary.days.reduce((s, d) => s + d.activities.length, 0);

    return (
        <div className="itin-panel">
            {/* Header */}
            <div className="itin-header">
                <div className="itin-header__left">
                    <span className="itin-header__icon">🗺️</span>
                    <div>
                        <div className="itin-header__title">
                            {itinerary.destination ? `${itinerary.destination}` : "Itinerary"}
                        </div>
                        <div className="itin-header__meta">
                            {itinerary.days.length} day{itinerary.days.length !== 1 ? "s" : ""} · {totalActivities} item{totalActivities !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>
                <div className="itin-header__actions">
                    <button
                        className="itin-action-btn"
                        onClick={copyToClipboard}
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy"}
                    </button>
                    <button className="icon-btn" onClick={onClose} title="Close itinerary">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {itinerary.days.length === 0 && (
                <div className="itin-empty">
                    <div className="itin-empty__icon">✈️</div>
                    <div className="itin-empty__title">Start building your trip</div>
                    <div className="itin-empty__desc">Add days and activities to create your itinerary. WanderAI will help populate it as you chat.</div>
                </div>
            )}

            {/* Days */}
            <div className="itin-days">
                {itinerary.days.map((day) => (
                    <div key={day.id} className="itin-day">
                        {/* Day header */}
                        <div className="itin-day__header">
                            <button
                                className="itin-day__toggle"
                                onClick={() => toggleCollapse(day.id)}
                            >
                                {collapsedDays[day.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                            <div className="itin-day__num">Day {day.day}</div>
                            <input
                                className="itin-day__label-input"
                                placeholder="Add title (optional)"
                                value={day.label ?? ""}
                                onChange={e => updateDayLabel(day.id, e.target.value)}
                            />
                            <button
                                className="icon-btn itin-day__del"
                                onClick={() => removeDay(day.id)}
                                title="Remove day"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        {!collapsedDays[day.id] && (
                            <>
                                {/* Activities */}
                                {day.activities.length > 0 && (
                                    <div className="itin-activities">
                                        {day.activities.map((act) => (
                                            <div key={act.id} className="itin-activity">
                                                <span className="itin-activity__icon">{ACTIVITY_ICONS[act.type]}</span>
                                                <div className="itin-activity__body">
                                                    <div className="itin-activity__top">
                                                        {act.time && <span className="itin-activity__time">{act.time}</span>}
                                                        <span className="itin-activity__title">{act.title}</span>
                                                    </div>
                                                    {act.description && (
                                                        <div className="itin-activity__desc">{act.description}</div>
                                                    )}
                                                    {act.link && (
                                                        <a
                                                            href={act.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="itin-activity__link"
                                                        >
                                                            <ExternalLink size={10} /> Open link
                                                        </a>
                                                    )}
                                                </div>
                                                <button
                                                    className="icon-btn itin-activity__del"
                                                    onClick={() => removeActivity(day.id, act.id)}
                                                    title="Remove"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add activity form */}
                                {addingActivity?.dayId === day.id ? (
                                    <div className="itin-add-form">
                                        <select
                                            className="itin-select"
                                            value={newActivity.type}
                                            onChange={e => setNewActivity(p => ({ ...p, type: e.target.value as ActivityType }))}
                                        >
                                            {ACTIVITY_TYPES.map(t => (
                                                <option key={t} value={t}>{ACTIVITY_ICONS[t]} {ACTIVITY_LABELS[t]}</option>
                                            ))}
                                        </select>
                                        <input
                                            className="itin-input"
                                            placeholder="Activity title *"
                                            value={newActivity.title ?? ""}
                                            onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))}
                                            autoFocus
                                            onKeyDown={e => e.key === "Enter" && saveActivity()}
                                        />
                                        <input
                                            className="itin-input"
                                            placeholder="Time (e.g. 9:00 AM)"
                                            value={newActivity.time ?? ""}
                                            onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))}
                                        />
                                        <input
                                            className="itin-input"
                                            placeholder="Notes (optional)"
                                            value={newActivity.description ?? ""}
                                            onChange={e => setNewActivity(p => ({ ...p, description: e.target.value }))}
                                        />
                                        <input
                                            className="itin-input"
                                            placeholder="Link (optional)"
                                            value={newActivity.link ?? ""}
                                            onChange={e => setNewActivity(p => ({ ...p, link: e.target.value }))}
                                        />
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button className="itin-save-btn" onClick={saveActivity}>Add</button>
                                            <button className="itin-cancel-btn" onClick={() => setAddingActivity(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="itin-add-activity-btn"
                                        onClick={() => startAddActivity(day.id)}
                                    >
                                        <Plus size={13} /> Add activity
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add day */}
            <div className="itin-footer">
                <button className="itin-add-day-btn" onClick={addDay}>
                    <Plus size={14} /> Add day
                </button>
            </div>
        </div>
    );
}

/* ── Auto-extract itinerary from AI text ── */
export function extractItineraryFromText(text: string, destination?: string): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    // Match "Day 1:", "**Day 1**:", "Day 1 —", etc.
    const dayRegex = /\*{0,2}Day\s+(\d+)\*{0,2}[:\s—–-]+([\s\S]*?)(?=\*{0,2}Day\s+\d+\*{0,2}[:\s—–-]|$)/gi;

    let match;
    while ((match = dayRegex.exec(text)) !== null) {
        const dayNum = parseInt(match[1]);
        const content = match[2].trim();
        const activities: ItineraryActivity[] = [];

        const lines = content.split("\n").filter(l => l.trim());
        lines.forEach((line, i) => {
            const clean = line
                .replace(/^\*\*|\*\*$/g, "")
                .replace(/^[-•*]\s+/, "")
                .replace(/^\d+\.\s+/, "")
                .trim();
            if (!clean || clean.length < 4) return;

            let type: ActivityType = "activity";
            const lower = clean.toLowerCase();
            if (/flight|fly|depart|arrive|airport|boarding/i.test(lower)) type = "flight";
            else if (/hotel|hostel|resort|check.?in|check.?out|accommodation|stay/i.test(lower)) type = "hotel";
            else if (/lunch|dinner|breakfast|restaurant|eat|food|café|cafe|cuisine|dine/i.test(lower)) type = "food";
            else if (/taxi|cab|bus|train|metro|auto|transfer|transport|drive/i.test(lower)) type = "transport";

            activities.push({ id: `${dayNum}-${i}`, type, title: clean });
        });

        if (activities.length > 0) {
            days.push({ id: `day-${dayNum}`, day: dayNum, activities });
        }
    }

    return days;
}
