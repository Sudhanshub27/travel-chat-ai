import { NextRequest, NextResponse } from "next/server";
import { TravelContext, TravelLink } from "@/types/travel";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

// Primary model: Gemini 2.5 Flash via OpenRouter
// Fallbacks for rate-limit or unavailability
const FREE_MODELS = [
    "google/gemini-2.5-flash",                   // Primary — Gemini 2.5 Flash
    "google/gemini-2.0-flash-exp:free",           // Fallback 1 — Gemini 2.0 Flash (free)
    "meta-llama/llama-3.3-70b-instruct:free",     // Fallback 2 — Llama 3.3 70B
    "mistralai/mistral-7b-instruct:free",          // Fallback 3 — Mistral 7B
];


const SYSTEM_PROMPT = `You are WanderAI, a friendly and knowledgeable AI travel companion. Your goal is to help users plan their perfect trip through natural conversation.

## Your Personality
- Warm, enthusiastic, and encouraging
- Expert travel knowledge with local insights
- Concise but helpful — don't overwhelm with text
- Use emojis thoughtfully to make responses feel alive

## Conversation Flow
Guide users through gathering these details naturally (not all at once):
1. Destination - Where do they want to go?
2. Origin - Where are they traveling from?
3. Dates - When and for how long?
4. Group size - How many people?
5. Budget - Budget / Mid-range / Luxury
6. Travel style - Adventure, relaxation, culture, food, family, honeymoon, etc.

## When Suggesting
When you have enough info (at minimum a destination), include booking links in this EXACT JSON block at the END of your message:

\`\`\`json
{
  "links": [
    {
      "label": "Google Flights",
      "url": "https://www.google.com/travel/flights/search?q=flights+from+Delhi+to+Goa",
      "icon": "✈️",
      "category": "flight",
      "description": "Compare all airlines"
    },
    {
      "label": "Hotels on Booking.com",
      "url": "https://www.booking.com/searchresults.html?ss=Goa&group_adults=2",
      "icon": "🏨",
      "category": "hotel",
      "description": "Top-rated hotels"
    },
    {
      "label": "Airbnb Stays",
      "url": "https://www.airbnb.co.in/s/Goa/homes?adults=2",
      "icon": "🏠",
      "category": "stay",
      "description": "Unique local stays"
    },
    {
      "label": "Activities on Viator",
      "url": "https://www.viator.com/search/Goa",
      "icon": "🎯",
      "category": "activity",
      "description": "Tours and experiences"
    }
  ],
  "suggestions": ["Show budget homestays", "Best beaches in Goa", "What to eat in Goa?"]
}
\`\`\`

## URL Rules
Always use real city names in URLs:
- Flights: https://www.google.com/travel/flights/search?q=flights+from+ORIGIN+to+DESTINATION
- MakeMyTrip: https://www.makemytrip.com/flights/international/ORIGIN-to-DESTINATION/
- Booking.com: https://www.booking.com/searchresults.html?ss=CITY&group_adults=N
- Airbnb: https://www.airbnb.co.in/s/CITY/homes?adults=N
- Viator: https://www.viator.com/search/CITY
- Google Maps: https://www.google.com/maps/search/things+to+do+in+CITY

## Budget Guidance
- Budget: Hostels, budget airlines, street food, free attractions
- Mid-range: 3-4 star hotels, standard flights, mix of options
- Luxury: 5-star resorts, business class, private tours, fine dining

## India Tips
- For domestic India: prioritize MakeMyTrip, Cleartrip, Goibibo
- Popular spots: Goa, Kerala, Rajasthan, Manali, Ladakh, Coorg, Andaman

IMPORTANT: Always end with the JSON block when you have a destination to suggest.`;

// Build fallback booking links from travel context
function buildFallbackLinks(context: TravelContext): TravelLink[] {
    const dest = context.destination || "";
    if (!dest) return [];

    const destEncoded = encodeURIComponent(dest);
    const destSlug = dest.toLowerCase().replace(/\s+/g, "-");
    const origin = context.origin || "Delhi";
    const originSlug = origin.toLowerCase().replace(/\s+/g, "-");
    const people = context.people || 2;

    const today = new Date();
    const dep = new Date(today.setDate(today.getDate() + 30));
    const ret = new Date(dep.getTime() + 7 * 24 * 60 * 60 * 1000);
    const depStr = dep.toISOString().split("T")[0];
    const retStr = ret.toISOString().split("T")[0];

    const links: TravelLink[] = [
        {
            label: "Search Flights on Google",
            url: `https://www.google.com/travel/flights/search?q=flights+from+${encodeURIComponent(origin)}+to+${destEncoded}`,
            icon: "✈️",
            category: "flight",
            description: "Compare all airlines instantly",
        },
        {
            label: "MakeMyTrip Flights",
            url: `https://www.makemytrip.com/flights/international/${originSlug}-to-${destSlug}/`,
            icon: "🛫",
            category: "flight",
            description: "Best Indian airline deals",
        },
        {
            label: "Skyscanner",
            url: `https://www.skyscanner.co.in/transport/flights/${origin.substring(0, 3).toUpperCase()}/${dest.substring(0, 3).toUpperCase()}/`,
            icon: "🔍",
            category: "flight",
            description: "Compare cheapest fares",
        },
    ];

    if (context.budget === "luxury") {
        links.push(
            {
                label: "Luxury Hotels – Booking.com",
                url: `https://www.booking.com/searchresults.html?ss=${destEncoded}&checkin=${depStr}&checkout=${retStr}&group_adults=${people}&nflt=class%3D5`,
                icon: "🏰",
                category: "hotel",
                description: "5-star luxury properties",
            },
            {
                label: "Taj Hotels",
                url: `https://www.tajhotels.com/en-in/find-a-hotel/?destination=${destEncoded}`,
                icon: "👑",
                category: "hotel",
                description: "Iconic Indian luxury",
            }
        );
    } else {
        links.push(
            {
                label: "Hotels on Booking.com",
                url: `https://www.booking.com/searchresults.html?ss=${destEncoded}&checkin=${depStr}&checkout=${retStr}&group_adults=${people}`,
                icon: "🏨",
                category: "hotel",
                description: "Wide range of options",
            },
            {
                label: "MakeMyTrip Hotels",
                url: `https://www.makemytrip.com/hotels/hotel-listing/?city=${destEncoded}`,
                icon: "🏩",
                category: "hotel",
                description: "Trusted Indian hotel booking",
            }
        );
    }

    links.push(
        {
            label: "Airbnb Stays",
            url: `https://www.airbnb.co.in/s/${destEncoded}/homes?adults=${people}&checkin=${depStr}&checkout=${retStr}`,
            icon: "🏠",
            category: "stay",
            description: "Unique local stays and villas",
        },
        {
            label: "Activities on Viator",
            url: `https://www.viator.com/search/${destEncoded}`,
            icon: "🎯",
            category: "activity",
            description: "Tours, experiences and day trips",
        },
        {
            label: "Explore on Google Maps",
            url: `https://www.google.com/maps/search/things+to+do+in+${destEncoded}`,
            icon: "🗺️",
            category: "map",
            description: "Local hotspots and navigation",
        }
    );

    return links;
}

// Call OpenRouter — tries each model in order, handles errors gracefully
async function callOpenRouter(
    messages: Array<{ role: string; content: string }>,
    modelIndex = 0
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in .env.local");

    if (modelIndex >= FREE_MODELS.length) {
        throw new Error("All models exhausted — please try again later");
    }

    const model = FREE_MODELS[modelIndex];
    console.log(`[WanderAI] Trying model ${modelIndex + 1}/${FREE_MODELS.length}: ${model}`);

    const resp = await fetch(OPENROUTER_BASE, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://wanderai.vercel.app",
            "X-Title": "WanderAI Travel Assistant",
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: 1200,
            temperature: 0.7,
        }),
    });

    if (!resp.ok) {
        const errBody = await resp.text();
        console.warn(`[WanderAI] ${model} failed (HTTP ${resp.status}): ${errBody.slice(0, 200)}`);

        const isSystemPromptError =
            errBody.includes("Developer instruction is not enabled") ||
            errBody.includes("system role") ||
            errBody.includes("systemInstruction") ||
            (resp.status === 400 && errBody.includes("not supported"));

        const isInvalidModelError =
            errBody.includes("not a valid model") ||
            errBody.includes("model not found") ||
            errBody.includes("No endpoints found");

        const shouldFallback =
            resp.status === 429 ||
            resp.status === 503 ||
            resp.status === 502 ||
            isInvalidModelError ||
            (resp.status === 400 && isSystemPromptError);

        if (shouldFallback) {
            if (isSystemPromptError) {
                console.log(`[WanderAI] System prompt not supported — injecting as user message`);
                const noSystem = messages.filter((m) => m.role !== "system");
                if (noSystem.length > 0 && noSystem[0].role === "user") {
                    noSystem[0] = {
                        role: "user",
                        content: `[You are WanderAI, a helpful travel assistant. Suggest real booking links.]\n\n${noSystem[0].content}`,
                    };
                }
                return callOpenRouter(noSystem, modelIndex + 1);
            }
            return callOpenRouter(messages, modelIndex + 1);
        }

        throw new Error(`OpenRouter error ${resp.status}: ${errBody.slice(0, 300)}`);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenRouter");

    console.log(`[WanderAI] Success with: ${model} ✓`);
    return content as string;
}

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = (await req.json()) as {
            messages: Array<{ role: string; content: string }>;
            context: TravelContext;
        };

        const lastUserMsg = messages[messages.length - 1];

        // Build conversation history — skip static welcome, enforce alternating turns
        const rawHistory = messages.slice(0, -1).map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
        }));

        // Drop leading assistant messages (e.g. static welcome)
        let start = 0;
        while (start < rawHistory.length && rawHistory[start].role === "assistant") {
            start++;
        }
        const trimmed = rawHistory.slice(start);

        // Enforce strictly alternating turns
        const history: Array<{ role: string; content: string }> = [];
        for (const turn of trimmed) {
            if (history.length === 0 || history[history.length - 1].role !== turn.role) {
                history.push(turn);
            }
        }

        // Inject travel context as a hint
        const contextHint =
            context.destination || context.budget || context.people
                ? `[Trip context: destination=${context.destination || "?"}, from=${context.origin || "?"}, people=${context.people || "?"}, budget=${context.budget || "?"}, duration=${context.duration || "?"}]\n\n`
                : "";

        const openRouterMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: contextHint + lastUserMsg.content },
        ];

        const responseText = await callOpenRouter(openRouterMessages);

        // Parse AI-provided JSON links block
        let links: TravelLink[] = [];
        let suggestions: string[] = [];
        let cleanMessage = responseText;

        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.links && Array.isArray(parsed.links)) links = parsed.links;
                if (parsed.suggestions && Array.isArray(parsed.suggestions)) suggestions = parsed.suggestions;
                cleanMessage = responseText.replace(/```json\n?[\s\S]*?\n?```/g, "").trim();
            } catch {
                // JSON parse failed — use fallback links below
            }
        }

        // Build programmatic links if AI didn't provide them
        if (context.destination && links.length === 0) {
            links = buildFallbackLinks(context);
        }

        // Default suggestion chips
        if (suggestions.length === 0) {
            suggestions = context.destination
                ? ["💰 Budget options", "👑 Luxury upgrade", "🍽️ Food & restaurants", "📅 Best time to visit", "🏛️ Top attractions"]
                : ["🏖️ Beach vacation", "🏔️ Mountain trip", "🌍 International travel", "🇮🇳 Explore India"];
        }

        return NextResponse.json({ message: cleanMessage, links, suggestions });
    } catch (err) {
        console.error("[WanderAI] Chat API error:", err);
        const msg = String((err as Error)?.message || "");
        const isRateLimit = msg.includes("429") || msg.includes("Too Many Requests");

        return NextResponse.json(
            {
                message: isRateLimit
                    ? "⏳ Too many requests right now — please wait a moment and try again!"
                    : "I'm having trouble connecting. Please try again! 🙏",
                links: [],
                suggestions: ["Try again", "Start fresh"],
            },
            { status: 200 }
        );
    }
}
