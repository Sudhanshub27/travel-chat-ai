"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, RotateCcw, Map } from "lucide-react";
import { Message, TravelContext, Itinerary, TravelLink } from "@/types/travel";
import ChatMessage, { TypingIndicator } from "./ChatMessage";
import ItineraryBuilder, { extractItineraryFromText } from "./ItineraryBuilder";

/* Simple context extractor from text */
function updateContextFromMessage(text: string, current: TravelContext): TravelContext {
    const next = { ...current };
    const low = text.toLowerCase();

    if (low.includes("budget")) next.budget = "budget";
    else if (low.includes("luxury")) next.budget = "luxury";
    else if (low.includes("mid") || low.includes("moderate")) next.budget = "mid-range";

    if (low.includes("days") || low.includes("week")) {
        const match = text.match(/(\d+)\s*(day|week|night)/i);
        if (match) next.duration = match[0];
    }

    return next;
}

/* Strip emojis, markdown, URLs before handing text to speech synthesis */
function cleanForSpeech(text: string): string {
    return text
        // Remove all emoji (Unicode ranges)
        .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}]/gu, "")
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
        .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
        // Remove markdown: **bold**, *italic*, `code`, ## headings, --- dividers
        .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^[-_*]{3,}$/gm, "")
        // Remove URLs and markdown links
        .replace(/https?:\/\/[^\s)]+/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove leftover symbols and collapse whitespace
        .replace(/[\|~^]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

const INITIAL_MESSAGE: Message = {
    id: "welcome",
    role: "assistant",
    content: `Hi! I'm **WanderAI**, your travel planning assistant.

Tell me where you'd like to go and I'll help you find flights, hotels, and activities with real booking links.

**Where are you thinking of traveling?**`,
    timestamp: new Date(),
    suggestions: [
        "Beach vacation",
        "Mountain adventure",
        "City break",
        "Nature retreat",
        "Honeymoon trip",
        "Family holiday",
    ],
};

const INITIAL_CONTEXT: TravelContext = { phase: "greeting" };
const EMPTY_ITINERARY: Itinerary = { days: [] };

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState<TravelContext>(INITIAL_CONTEXT);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [hasVoiceSupport, setHasVoiceSupport] = useState(false);
    const [showItinerary, setShowItinerary] = useState(false);
    const [itinerary, setItinerary] = useState<Itinerary>(EMPTY_ITINERARY);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        const hasSpeechRecognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
        const hasSpeechSynthesis = "speechSynthesis" in window;
        setHasVoiceSupport(hasSpeechRecognition && hasSpeechSynthesis);
        if (hasSpeechSynthesis) synthRef.current = window.speechSynthesis;
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

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
        const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text).slice(0, 600));
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
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

        const updatedContext = updateContextFromMessage(text, context);
        setContext(updatedContext);
        setInput("");

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const assistantId = (Date.now() + 1).toString();
        const placeholderMessage: Message = {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, placeholderMessage]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    context: updatedContext,
                }),
            });

            if (!response.ok || !response.body) throw new Error("Stream failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullText += chunk;

                setMessages(prev =>
                    prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
                );
            }

            let cleanMessage = fullText;
            let links: TravelLink[] = [];
            let suggestions: string[] = [];

            const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[1]);
                    links = parsed.links || [];
                    suggestions = parsed.suggestions || [];
                    cleanMessage = fullText.replace(/```json\n?[\s\S]*?\n?```/g, "").trim();
                } catch { /* parse fail */ }
            }

            setMessages(prev =>
                prev.map(m => m.id === assistantId ? {
                    ...m,
                    content: cleanMessage,
                    links: links.length > 0 ? links : m.links,
                    suggestions: suggestions.length > 0 ? suggestions : m.suggestions
                } : m)
            );

            speak(cleanMessage);

            const extractedDays = extractItineraryFromText(cleanMessage, updatedContext.destination);
            if (extractedDays.length > 0) {
                setItinerary(prev => ({
                    destination: updatedContext.destination || prev.destination,
                    days: extractedDays,
                }));
                setShowItinerary(true);
            } else if (updatedContext.destination && !itinerary.destination) {
                setItinerary(prev => ({ ...prev, destination: updatedContext.destination }));
            }

        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => prev.filter(m => m.id !== assistantId).concat([{
                id: Date.now().toString(),
                role: "assistant",
                content: "I'm having trouble connecting to my brain. Please try again!",
                timestamp: new Date(),
                suggestions: ["Try again"],
            }]));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [input, isLoading, messages, context, speak, itinerary.destination]);

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
        setItinerary(EMPTY_ITINERARY);
        setShowItinerary(false);
        synthRef.current?.cancel();
    };

    const hasContext = context.destination || context.budget || context.people || context.duration;
    const itineraryItemCount = itinerary.days.reduce((s, d) => s + d.activities.length, 0);

    return (
        <div className="chat-root">
            {/* Main chat column */}
            <div className="chat-column">
                {/* Header */}
                <header className="app-header">
                    <div className="app-header__identity">
                        <div className="app-header__logo">✈</div>
                        <div>
                            <div className="app-header__name">WanderAI</div>
                            <div className="app-header__status">
                                <div className="status-dot" />
                                Ready
                            </div>
                        </div>
                    </div>

                    <div className="app-header__actions">
                        {hasVoiceSupport && (
                            <button
                                className={`icon-btn ${voiceEnabled ? "active" : ""}`}
                                onClick={() => setVoiceEnabled(v => !v)}
                                title={voiceEnabled ? "Mute voice" : "Enable voice"}
                            >
                                {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                            </button>
                        )}
                        <button
                            className={`icon-btn ${showItinerary ? "active" : ""}`}
                            onClick={() => setShowItinerary(v => !v)}
                            title="Itinerary builder"
                            style={{ position: "relative" }}
                        >
                            <Map size={14} />
                            {itineraryItemCount > 0 && !showItinerary && (
                                <span className="itin-badge">{itinerary.days.length}</span>
                            )}
                        </button>
                        <button className="icon-btn" onClick={resetChat} title="New trip">
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </header>

                {/* Context bar */}
                {hasContext && (
                    <div className="context-bar">
                        {context.destination && <span className="ctx-tag">📍 {context.destination}</span>}
                        {context.origin && <span className="ctx-tag">from {context.origin}</span>}
                        {context.people && <span className="ctx-tag">{context.people} people</span>}
                        {context.budget && <span className="ctx-tag">{context.budget}</span>}
                        {context.duration && <span className="ctx-tag">{context.duration}</span>}
                    </div>
                )}

                {/* Messages */}
                <div className="messages-area">
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

                {/* Input */}
                <div className="input-bar">
                    <div className="input-wrap">
                        <textarea
                            ref={inputRef}
                            className="input-field"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Where would you like to go?"
                            rows={1}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 120) + "px";
                            }}
                        />
                        <div className="input-actions">
                            {hasVoiceSupport && (
                                <button
                                    className={`icon-btn ${isRecording ? "active" : ""}`}
                                    onClick={toggleRecording}
                                    title={isRecording ? "Stop" : "Voice input"}
                                    style={isRecording ? { borderColor: "#ef4444", color: "#ef4444" } : {}}
                                >
                                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                                </button>
                            )}
                            <button
                                className="send-btn"
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </div>
                    <p className="input-hint">
                        Enter to send · Shift+Enter for new line
                        {hasVoiceSupport && " · Mic for voice"}
                    </p>
                </div>
            </div>

            {/* Itinerary panel */}
            {showItinerary && (
                <ItineraryBuilder
                    itinerary={itinerary}
                    onChange={setItinerary}
                    onClose={() => setShowItinerary(false)}
                />
            )}
        </div>
    );
}
