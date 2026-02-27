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
- Write naturally, as if speaking to someone — sentences should sound good when read aloud

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

## Emoji Rules
- Use emojis naturally and liberally throughout your response to make it visually engaging and friendly.
- Use travel-related emojis (✈️, 🏖️, 🏨, 🗺️) and expressive ones (😊, ✨, 🌍) to highlight recommendations.
- Emojis help break up text and make the conversation feel more interactive.

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
            label: "Google Flights",
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
        {
            label: "Goibibo Flights",
            url: `https://www.goibibo.com/flights/search?sourceCityCode=DEL&destinationCityCode=${dest.substring(0, 3).toUpperCase()}&travelDate=${depStr}&seatType=E&adults=1`,
            icon: "🛩️",
            category: "flight",
            description: "Great offers on flights",
        },
    ];

    if (context.budget === "luxury") {
        links.push(
            {
                label: "Booking.com – Luxury",
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
            },
            {
                label: "Agoda Luxury",
                url: `https://www.agoda.com/search?city=${destEncoded}&checkIn=${depStr}&checkOut=${retStr}&adults=${people}&rooms=1&rating=80`,
                icon: "🌟",
                category: "hotel",
                description: "Best luxury rates in Asia",
            },
            {
                label: "Hotels.com",
                url: `https://www.hotels.com/search.do?q-destination=${destEncoded}&q-check-in=${depStr}&q-check-out=${retStr}&q-rooms=1&q-room-0-adults=${people}`,
                icon: "🏯",
                category: "hotel",
                description: "Exclusive deals & rewards",
            }
        );
    } else {
        links.push(
            {
                label: "Booking.com",
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
            },
            {
                label: "OYO Rooms",
                url: `https://www.oyorooms.com/search/?location=${destEncoded}`,
                icon: "🛏️",
                category: "hotel",
                description: "Budget & mid-range hotels",
            },
            {
                label: "Agoda",
                url: `https://www.agoda.com/search?city=${destEncoded}&checkIn=${depStr}&checkOut=${retStr}&adults=${people}&rooms=1`,
                icon: "🌐",
                category: "hotel",
                description: "Great Asia-Pacific deals",
            },
            {
                label: "Hotels.com",
                url: `https://www.hotels.com/search.do?q-destination=${destEncoded}&q-check-in=${depStr}&q-check-out=${retStr}&q-rooms=1&q-room-0-adults=${people}`,
                icon: "🏦",
                category: "hotel",
                description: "Collect nights, get free stays",
            },
            {
                label: "Goibibo Hotels",
                url: `https://www.goibibo.com/hotels/hotels-in-${destSlug}/`,
                icon: "🏪",
                category: "hotel",
                description: "Instant discounts & GoCash",
            },
            {
                label: "Cleartrip",
                url: `https://www.cleartrip.com/hotels/results/?city=${destEncoded}&adults=2&children=0&rooms=1`,
                icon: "🔷",
                category: "hotel",
                description: "Simple, no-fuss booking",
            },
            {
                label: "Expedia",
                url: `https://www.expedia.co.in/Hotel-Search?destination=${destEncoded}&adults=${people}&startDate=${depStr}&endDate=${retStr}`,
                icon: "🌍",
                category: "hotel",
                description: "Bundle deals with flights",
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

// Build context-aware suggestions based on conversation state
function buildContextualSuggestions(context: TravelContext, lastUserMessage: string): string[] {
    const msg = lastUserMessage.toLowerCase();
    const dest = context.destination || "";

    if (!dest) {
        if (msg.includes("beach")) return ["Goa", "Maldives", "Bali", "Phuket", "Andaman"];
        if (msg.includes("mountain")) return ["Manali", "Shimla", "Ladakh", "Sikkim"];
        return ["Beach vacation", "Mountain trip", "Budget trip India", "Luxury getaway"];
    }

    if (msg.includes("food")) return [`Best restaurants in ${dest}`, `Street food in ${dest}`];
    if (msg.includes("hotel")) return [`Luxury resorts in ${dest}`, `Budget stay in ${dest}`];
    return [`Things to do in ${dest}`, `Best time to visit ${dest}`, `5-day itinerary`];
}

// Main POST handler — supports streaming responses
export async function POST(req: NextRequest) {
    try {
        const { messages, context } = (await req.json()) as {
            messages: Array<{ role: string; content: string }>;
            context: TravelContext;
        };

        const lastUserMsg = messages[messages.length - 1];

        // Build history (drop welcome, enforce alternating)
        const history: Array<{ role: string; content: string }> = [];
        for (const m of messages.slice(0, -1)) {
            if (m.role === "system") continue;
            if (history.length === 0 || history[history.length - 1].role !== m.role) {
                history.push({ role: m.role, content: m.content });
            }
        }

        const contextHint = context.destination
            ? `[Trip context: destination=${context.destination}, from=${context.origin || "?"}, budget=${context.budget || "?"}]\n\n`
            : "";

        const openRouterMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: contextHint + lastUserMsg.content },
        ];

        return await callOpenRouterStream(openRouterMessages);
    } catch (err) {
        console.error("[WanderAI] Chat API error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

async function callOpenRouterStream(
    messages: Array<{ role: string; content: string }>,
    modelIndex = 0
): Promise<Response> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

    if (modelIndex >= FREE_MODELS.length) {
        return new Response("All models exhausted", { status: 503 });
    }

    const model = FREE_MODELS[modelIndex];
    console.log(`[WanderAI] Streaming with: ${model}`);

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
            stream: true,
            max_tokens: 1200,
            temperature: 0.7,
        }),
    });

    if (!resp.ok) {
        console.warn(`[WanderAI] ${model} failed, trying next...`);
        return callOpenRouterStream(messages, modelIndex + 1);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
        async start(controller) {
            const reader = resp.body?.getReader();
            if (!reader) {
                controller.close();
                return;
            }

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n").filter(l => l.trim().startsWith("data: "));

                    for (const line of lines) {
                        const dataStr = line.replace("data: ", "").trim();
                        if (dataStr === "[DONE]") continue;

                        try {
                            const data = JSON.parse(dataStr);
                            const text = data.choices?.[0]?.delta?.content || "";
                            if (text) controller.enqueue(encoder.encode(text));
                        } catch (e) { }
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}
