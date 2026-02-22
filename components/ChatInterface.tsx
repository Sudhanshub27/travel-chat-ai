"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Plane, RefreshCw } from "lucide-react";
import { Message, TravelContext } from "@/types/travel";
import ChatMessage, { TypingIndicator } from "./ChatMessage";

const INITIAL_MESSAGE: Message = {
    id: "welcome",
    role: "assistant",
    content: `Hey there, wanderer! 🌍✨

I'm **WanderAI** — your personal travel companion. I'll help you plan your perfect trip from scratch, completely through conversation!

Tell me — **where are you dreaming of going?** ✈️

Or just describe what kind of trip you're looking for and I'll take it from there!`,
    timestamp: new Date(),
    suggestions: [
        "🏖️ Beach vacation",
        "🏔️ Mountain adventure",
        "🏛️ Cultural city trip",
        "🌿 Nature retreat",
        "💑 Honeymoon trip",
        "👨‍👩‍👧 Family holiday",
    ],
};

const INITIAL_CONTEXT: TravelContext = { phase: "greeting" };

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState<TravelContext>(INITIAL_CONTEXT);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [hasVoiceSupport, setHasVoiceSupport] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Check voice support
    useEffect(() => {
        const hasSpeechRecognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
        const hasSpeechSynthesis = "speechSynthesis" in window;
        setHasVoiceSupport(hasSpeechRecognition && hasSpeechSynthesis);
        if (hasSpeechSynthesis) synthRef.current = window.speechSynthesis;
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Listen for quick reply events from chips
    useEffect(() => {
        const handler = (e: CustomEvent) => {
            setInput(e.detail);
            setTimeout(() => sendMessage(e.detail), 100);
        };
        window.addEventListener("quickReply", handler as EventListener);
        return () => window.removeEventListener("quickReply", handler as EventListener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context, messages]);

    const speak = useCallback((text: string) => {
        if (!voiceEnabled || !synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, "").slice(0, 500));
        utterance.rate = 1.05;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        // Try to find a pleasant voice
        const voices = synthRef.current.getVoices();
        const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Female"))
            || voices.find(v => v.lang.startsWith("en"))
            || voices[0];
        if (preferred) utterance.voice = preferred;
        synthRef.current.speak(utterance);
    }, [voiceEnabled]);

    const sendMessage = useCallback(async (messageText?: string) => {
        const text = (messageText ?? input).trim();
        if (!text || isLoading) return;

        setInput("");

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const allMessages = [...messages, userMessage];
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: allMessages.map(m => ({ role: m.role, content: m.content })),
                    context,
                }),
            });

            const data = await res.json();

            // Update context based on message content
            const updatedContext = { ...context };
            const lowerText = text.toLowerCase();

            if (updatedContext.phase === "greeting" || updatedContext.phase === "collecting_destination") {
                updatedContext.phase = "collecting_origin";
            }

            // Simple extraction heuristics
            if (lowerText.includes("budget")) updatedContext.budget = "budget";
            else if (lowerText.includes("luxury")) updatedContext.budget = "luxury";
            else if (lowerText.includes("mid") || lowerText.includes("moderate")) updatedContext.budget = "mid-range";

            const peopleMatch = text.match(/(\d+)\s*(people|person|pax|adult|passenger)/i);
            if (peopleMatch) updatedContext.people = parseInt(peopleMatch[1]);

            setContext(updatedContext);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.message,
                timestamp: new Date(),
                links: data.links || [],
                suggestions: data.suggestions || [],
            };

            setMessages(prev => [...prev, assistantMessage]);
            speak(data.message);
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Oops! Something went wrong. Please try again! 🙏",
                    timestamp: new Date(),
                    suggestions: ["Try again"],
                },
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [input, isLoading, messages, context, speak]);

    const toggleRecording = useCallback(() => {
        if (!hasVoiceSupport) return;

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsRecording(false);
            setTimeout(() => sendMessage(transcript), 200);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
    }, [hasVoiceSupport, isRecording, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetChat = () => {
        setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
        setContext(INITIAL_CONTEXT);
        setInput("");
        synthRef.current?.cancel();
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
        }}>
            {/* Header */}
            <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-glass)",
                background: "rgba(7,11,20,0.9)",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                zIndex: 10,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #06b6d4, #3b7ef8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 0 20px rgba(6,182,212,0.3)",
                    }}
                        className="animate-glow"
                    >
                        ✈️
                    </div>
                    <div>
                        <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                            WanderAI
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#10b981",
                                boxShadow: "0 0 6px #10b981",
                            }} />
                            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 500 }}>Online — Ready to plan!</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {context.destination && (
                        <div style={{
                            background: "rgba(59,126,248,0.1)",
                            border: "1px solid rgba(59,126,248,0.25)",
                            borderRadius: "20px",
                            padding: "4px 12px",
                            fontSize: "12px",
                            color: "#93b4fc",
                            fontWeight: 500,
                        }}>
                            📍 {context.destination}
                        </div>
                    )}

                    {hasVoiceSupport && (
                        <button
                            onClick={() => setVoiceEnabled(v => !v)}
                            title={voiceEnabled ? "Mute voice responses" : "Enable voice responses"}
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                border: "1px solid var(--border-glass)",
                                background: voiceEnabled ? "rgba(59,126,248,0.15)" : "var(--bg-glass)",
                                color: voiceEnabled ? "#93b4fc" : "var(--text-muted)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s",
                            }}
                        >
                            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                    )}

                    <button
                        onClick={resetChat}
                        title="Start new trip"
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            border: "1px solid var(--border-glass)",
                            background: "var(--bg-glass)",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                        }}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Context bar */}
            {(context.destination || context.budget || context.people || context.duration) && (
                <div style={{
                    padding: "8px 20px",
                    borderBottom: "1px solid var(--border-glass)",
                    background: "rgba(59,126,248,0.04)",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    flexShrink: 0,
                }}>
                    {context.destination && <span style={{ fontSize: "11px", color: "#64b5f6", background: "rgba(59,126,248,0.1)", padding: "2px 8px", borderRadius: "10px" }}>📍 {context.destination}</span>}
                    {context.origin && <span style={{ fontSize: "11px", color: "#64b5f6", background: "rgba(59,126,248,0.1)", padding: "2px 8px", borderRadius: "10px" }}>🛫 from {context.origin}</span>}
                    {context.people && <span style={{ fontSize: "11px", color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: "10px" }}>👥 {context.people} people</span>}
                    {context.budget && <span style={{ fontSize: "11px", color: "#34d399", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: "10px" }}>💰 {context.budget}</span>}
                    {context.duration && <span style={{ fontSize: "11px", color: "#fbbf24", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: "10px" }}>🗓️ {context.duration}</span>}
                </div>
            )}

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
            }}>
                {messages.map((message, i) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        isLatest={i === messages.length - 1}
                    />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--border-glass)",
                background: "rgba(7,11,20,0.95)",
                backdropFilter: "blur(20px)",
                flexShrink: 0,
            }}>
                <div style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-end",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding: "10px 12px",
                    transition: "border-color 0.2s",
                }}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tell me about your dream trip... 🌍"
                        rows={1}
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "var(--text-primary)",
                            fontSize: "14px",
                            fontFamily: "inherit",
                            resize: "none",
                            lineHeight: "1.5",
                            maxHeight: "120px",
                            overflowY: "auto",
                            padding: "2px 0",
                        }}
                        onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = "auto";
                            el.style.height = Math.min(el.scrollHeight, 120) + "px";
                        }}
                    />

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {hasVoiceSupport && (
                            <button
                                onClick={toggleRecording}
                                className={`voice-btn ${isRecording ? "recording" : ""}`}
                                title={isRecording ? "Stop recording" : "Speak your message"}
                                style={{
                                    background: isRecording
                                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                        : "rgba(255,255,255,0.06)",
                                    color: isRecording ? "white" : "var(--text-secondary)",
                                    transition: "all 0.3s",
                                }}
                            >
                                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                        )}

                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                            className="btn-primary"
                            style={{
                                width: "42px",
                                height: "42px",
                                padding: 0,
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: !input.trim() || isLoading ? 0.5 : 1,
                            }}
                        >
                            {isLoading ? (
                                <Plane size={18} style={{ animation: "float 1s ease-in-out infinite" }} />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <p style={{
                    textAlign: "center",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                }}>
                    Press <kbd style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>Enter</kbd> to send &nbsp;•&nbsp;
                    <kbd style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>Shift+Enter</kbd> for new line
                    {hasVoiceSupport && <>&nbsp;•&nbsp; 🎤 Voice input available</>}
                </p>
            </div>
        </div>
    );
}
