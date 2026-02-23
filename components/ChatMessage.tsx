"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/types/travel";
import LinkCards from "./LinkCards";

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

const MarkdownComponents = {
    p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }: any) => <strong className="font-semibold text-[var(--text-1)]">{children}</strong>,
    h1: ({ children }: any) => <h1 className="text-lg font-bold text-[var(--text-1)] mt-4 mb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-base font-bold text-[var(--text-1)] mt-3 mb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-sm font-bold text-[var(--text-1)] mt-2 mb-1">{children}</h3>,
    ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="text-sm leading-relaxed">{children}</li>,
    code: ({ children }: any) => <code className="bg-[var(--bg-elevated)] px-1 rounded text-xs font-mono">{children}</code>,
    blockquote: ({ children }: any) => <blockquote className="border-l-2 border-[var(--accent)] pl-3 italic my-2">{children}</blockquote>,
};

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
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents as any}
                            >
                                {message.content}
                            </ReactMarkdown>
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
