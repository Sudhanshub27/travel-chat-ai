"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/types/travel";
import LinkCards from "./LinkCards";

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

function formatText(text: string): React.ReactNode[] {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        if (!line.trim()) {
            elements.push(<br key={i} />);
            return;
        }

        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        if (line.startsWith("## ")) {
            elements.push(
                <h3 key={i} style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px", marginBottom: "4px" }}>
                    {line.slice(3)}
                </h3>
            );
        } else if (line.startsWith("- ") || line.startsWith("• ")) {
            elements.push(
                <div key={i} style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                    <span style={{ color: "var(--accent-primary)", flexShrink: 0 }}>•</span>
                    <span>{formatted.slice(1)}</span>
                </div>
            );
        } else {
            elements.push(<span key={i}>{formatted}<br /></span>);
        }
    });

    return elements;
}

export default function ChatMessage({ message, isLatest }: ChatMessageProps) {
    const isUser = message.role === "user";
    const bubbleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLatest && bubbleRef.current) {
            bubbleRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [isLatest]);

    return (
        <div
            ref={bubbleRef}
            className="animate-fade-slide"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                marginBottom: "16px",
            }}
        >
            {/* Avatar + name */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
                flexDirection: isUser ? "row-reverse" : "row"
            }}>
                <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isUser
                        ? "linear-gradient(135deg, #3b7ef8, #8b5cf6)"
                        : "linear-gradient(135deg, #06b6d4, #3b7ef8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    flexShrink: 0,
                }}>
                    {isUser ? "👤" : "✈️"}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                    {isUser ? "You" : "WanderAI"}
                </span>
            </div>

            {/* Bubble */}
            <div style={{
                maxWidth: "85%",
                ...(isUser
                    ? {
                        background: "linear-gradient(135deg, #3b7ef8, #8b5cf6)",
                        borderRadius: "18px 18px 4px 18px",
                        padding: "12px 16px",
                        color: "white",
                        fontSize: "14px",
                        lineHeight: "1.6",
                    }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "18px 18px 18px 4px",
                        padding: "14px 18px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        lineHeight: "1.7",
                    }
                ),
                backdropFilter: "blur(10px)",
            }}>
                {isUser ? (
                    message.content
                ) : (
                    <div>
                        <div style={{ color: "var(--text-secondary)" }}>
                            {formatText(message.content)}
                        </div>
                        {message.links && message.links.length > 0 && (
                            <LinkCards links={message.links} />
                        )}
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {!isUser && message.suggestions && message.suggestions.length > 0 && (
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "10px",
                    maxWidth: "85%"
                }}>
                    {message.suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="chip"
                            onClick={() => {
                                const event = new CustomEvent("quickReply", { detail: s });
                                window.dispatchEvent(event);
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Timestamp */}
            <span style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: "4px",
                paddingLeft: isUser ? 0 : "4px",
                paddingRight: isUser ? "4px" : 0,
            }}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="animate-fade-slide" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #06b6d4, #3b7ef8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                flexShrink: 0,
            }}>
                ✈️
            </div>
            <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px 18px 18px 4px",
                padding: "14px 18px",
                display: "flex",
                gap: "5px",
                alignItems: "center",
            }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
            </div>
        </div>
    );
}
