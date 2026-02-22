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
            elements.push(<br key={`br-${i}`} />);
            return;
        }

        // Split on **bold**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={j} style={{ fontWeight: 600, color: "var(--text-1)" }}>
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });

        if (line.startsWith("## ")) {
            elements.push(
                <div key={i} style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginTop: "10px", marginBottom: "4px" }}>
                    {line.slice(3)}
                </div>
            );
        } else if (line.startsWith("- ") || line.startsWith("• ")) {
            elements.push(
                <div key={i} style={{ display: "flex", gap: "8px", marginTop: "3px" }}>
                    <span style={{ color: "var(--text-3)", flexShrink: 0, marginTop: "1px" }}>–</span>
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
            className={`anim-fade-up msg-row msg-row--${isUser ? "user" : "ai"}`}
        >
            {/* Author line */}
            <div className="msg-meta">
                <div className={`msg-avatar msg-avatar--${isUser ? "user" : "ai"}`}>
                    {isUser ? "U" : "W"}
                </div>
                <span className="msg-author">{isUser ? "You" : "WanderAI"}</span>
            </div>

            {/* Bubble */}
            <div className={`msg-bubble msg-bubble--${isUser ? "user" : "ai"}`}>
                {isUser ? (
                    message.content
                ) : (
                    <div>
                        <div style={{ color: "var(--text-1)" }}>
                            {formatText(message.content)}
                        </div>
                        {message.links && message.links.length > 0 && (
                            <LinkCards links={message.links} />
                        )}
                    </div>
                )}
            </div>

            {/* Suggestion chips */}
            {!isUser && message.suggestions && message.suggestions.length > 0 && (
                <div className="chips-row">
                    {message.suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="chip"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent("quickReply", { detail: s }));
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <span className="msg-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="anim-fade-up msg-row msg-row--ai">
            <div className="msg-meta">
                <div className="msg-avatar msg-avatar--ai">W</div>
                <span className="msg-author">WanderAI</span>
            </div>
            <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
            </div>
        </div>
    );
}
