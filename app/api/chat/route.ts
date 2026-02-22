import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { TravelContext, TravelLink } from "@/types/travel";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are WanderAI, a friendly and knowledgeable AI travel companion. Your goal is to help users plan their perfect trip through a natural, conversational experience.

## Your Personality
- Warm, enthusiastic, and encouraging
- Expert travel knowledge with local insights
- Concise but helpful — don't overwhelm with text
- Use emojis thoughtfully to make responses feel alive

## Conversation Flow
Guide users through gathering these details naturally (not all at once):
1. **Destination** - Where do they want to go?
2. **Origin** - Where are they traveling from?
3. **Dates** - When and for how long?
4. **Group size** - How many people?
5. **Budget** - Budget / Mid-range / Luxury
6. **Travel style** - Adventure, relaxation, culture, food, family, honeymoon, etc.

## When Suggesting (CRITICAL - JSON FORMAT)
When you have enough info to make suggestions, you MUST include booking links in this exact JSON structure at the END of your message:

\`\`\`json
{
  "links": [
    {
      "label": "Google Flights",
      "url": "https://www.google.com/travel/flights/search?tfs=...",
      "icon": "✈️",
      "category": "flight",
      "description": "Best flight deals"
    },
    {
      "label": "Booking.com Hotels",
      "url": "https://www.booking.com/searchresults.html?ss=DESTINATION",
      "icon": "🏨",
      "category": "hotel",
      "description": "Top-rated hotels"
    }
  ],
  "suggestions": ["Tell me more about activities", "Show luxury options", "What about budget stays?"]
}
\`\`\`

## Link Generation Rules
Build REAL, functional search URLs:

### Flights:
- Google Flights: https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTEyLTAxagcIARIDREVMcgcIARIDQk9N (use actual IATA codes)
- Skyscanner: https://www.skyscanner.co.in/transport/flights/DEL/BOM/251201/ (use actual codes and dates YYYYMMDD)
- MakeMyTrip: https://www.makemytrip.com/flights/international/delhi-to-dubai/ (use city names)

### Hotels:
- Booking.com: https://www.booking.com/searchresults.html?ss=CITY&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&group_adults=2
- Hotels.com: https://www.hotels.com/search.do?q-destination=CITY
- MakeMyTrip Hotels: https://www.makemytrip.com/hotels/hotel-listing/?checkin=YYYYMMDD&city=CITY

### Stays/Unique:
- Airbnb: https://www.airbnb.co.in/s/CITY/homes?adults=2&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD
- StayVista: https://www.stayvista.com/villas-in-CITY
- Club Mahindra: https://www.clubmahindra.com/resort/search?destination=CITY

### Activities:
- Viator: https://www.viator.com/CITY/d1-ttd.html
- GetYourGuide: https://www.getyourguide.com/CITY-l1/

## Budget Guidance
- **Budget**: Focus on hostels, budget airlines, street food districts, free attractions
- **Mid-range**: 3-4 star hotels, standard flights, mix of dining options
- **Luxury**: 5-star resorts, business/first class, private tours, fine dining

## Tips
- Always personalize suggestions to their specific travel style
- Mention 2-3 must-visit spots for the destination
- For domestic India travel, prioritize Indian platforms (MakeMyTrip, Cleartrip, Goibibo)
- For international, include both global and Indian platforms
- Suggest the best travel months and local tips

Remember: ALWAYS end suggestions with the JSON block containing links and follow-up suggestions.`;

function buildSearchUrls(context: TravelContext): TravelLink[] {
    const links: TravelLink[] = [];
    const dest = context.destination || "destination";
    const destEncoded = encodeURIComponent(dest);
    const origin = context.origin || "Delhi";
    const people = context.people || 2;
    const budget = context.budget || "mid-range";

    // Default dates if not provided
    const today = new Date();
    const departDate = context.departureDate
        ? new Date(context.departureDate)
        : new Date(today.setDate(today.getDate() + 30));
    const returnDate = context.returnDate
        ? new Date(context.returnDate)
        : new Date(departDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const depStr = departDate.toISOString().split('T')[0];
    const retStr = returnDate.toISOString().split('T')[0];
    const depMmt = depStr.replace(/-/g, '');
    const retMmt = retStr.replace(/-/g, '');

    // Flights
    links.push({
        label: "Search Flights on Google",
        url: `https://www.google.com/travel/flights/search?tfs=CBwQARoeEgoyMDI1LTEyLTAxagcIARIDREVMcgcIARIDQk9N&curr=INR`,
        icon: "✈️",
        category: "flight",
        description: "Compare all airlines"
    });

    links.push({
        label: "MakeMyTrip Flights",
        url: `https://www.makemytrip.com/flights/international/${origin.toLowerCase().replace(/ /g, '-')}-to-${dest.toLowerCase().replace(/ /g, '-')}/?itinerary=ONE&tripType=O&paxType=A-${people}_C-0_I-0&srcCity=${origin}&dstCity=${dest}&depDate=${depStr}&preferredclass=E`,
        icon: "🛫",
        category: "flight",
        description: "Best Indian airline deals"
    });

    links.push({
        label: "Skyscanner Flights",
        url: `https://www.skyscanner.co.in/transport/flights/${origin.substring(0, 3).toUpperCase()}/${dest.substring(0, 3).toUpperCase()}/${depMmt}/`,
        icon: "🔍",
        category: "flight",
        description: "Compare cheapest fares"
    });

    // Hotels based on budget
    if (budget === "luxury") {
        links.push({
            label: "Luxury Hotels on Booking.com",
            url: `https://www.booking.com/searchresults.html?ss=${destEncoded}&checkin=${depStr}&checkout=${retStr}&group_adults=${people}&nflt=class%3D5`,
            icon: "🏰",
            category: "hotel",
            description: "5-star luxury properties"
        });
        links.push({
            label: "Taj Hotels",
            url: `https://www.tajhotels.com/en-in/find-a-hotel/?destination=${destEncoded}`,
            icon: "👑",
            category: "hotel",
            description: "Iconic luxury experience"
        });
    } else {
        links.push({
            label: "Hotels on Booking.com",
            url: `https://www.booking.com/searchresults.html?ss=${destEncoded}&checkin=${depStr}&checkout=${retStr}&group_adults=${people}`,
            icon: "🏨",
            category: "hotel",
            description: "Wide range of options"
        });
    }

    links.push({
        label: "Airbnb Stays",
        url: `https://www.airbnb.co.in/s/${destEncoded}/homes?adults=${people}&checkin=${depStr}&checkout=${retStr}`,
        icon: "🏠",
        category: "stay",
        description: "Unique local stays"
    });

    links.push({
        label: "Activities on Viator",
        url: `https://www.viator.com/search/${destEncoded}`,
        icon: "🎯",
        category: "activity",
        description: "Tours & experiences"
    });

    links.push({
        label: "Explore on Google Maps",
        url: `https://www.google.com/maps/search/things+to+do+in+${destEncoded}`,
        icon: "🗺️",
        category: "map",
        description: "Local hotspots & navigation"
    });

    return links;
}

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json() as {
            messages: Array<{ role: string; content: string }>;
            context: TravelContext;
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPT,
        });

        // The last message is the current user prompt — send it separately
        const lastMessage = messages[messages.length - 1];

        // Build valid Gemini history from all messages EXCEPT the last one.
        // Rules:
        //  1. Map roles: "user" -> "user", anything else -> "model"
        //  2. Strip ALL leading "model" turns (Gemini requires history to START with "user")
        //  3. Ensure turns alternate correctly (drop duplicates of same role)
        const rawPairs = messages.slice(0, -1).map(m => ({
            role: m.role === "user" ? "user" as const : "model" as const,
            parts: [{ text: m.content }],
        }));

        // Drop leading model messages
        let start = 0;
        while (start < rawPairs.length && rawPairs[start].role === "model") {
            start++;
        }
        const trimmed = rawPairs.slice(start);

        // Ensure strictly alternating turns (user, model, user, model...)
        const history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
        for (const turn of trimmed) {
            if (history.length === 0 || history[history.length - 1].role !== turn.role) {
                history.push(turn);
            }
            // If same role as last, skip to maintain alternation
        }

        // Inject context summary into the user prompt for better AI awareness
        const contextStr = context.destination || context.budget || context.people
            ? `[Trip so far: destination=${context.destination || "unknown"}, from=${context.origin || "unknown"}, people=${context.people || "unknown"}, budget=${context.budget || "unknown"}, duration=${context.duration || "unknown"}]\n\n`
            : "";

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(contextStr + lastMessage.content);
        const responseText = result.response.text();

        // Parse JSON links if AI provided them
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
                // JSON parse failed — continue without parsed links
            }
        }

        // Programmatically build links if AI didn't provide them but we have a destination
        if (context.destination && links.length === 0) {
            links = buildSearchUrls(context);
        }

        // Provide default follow-up chips
        if (suggestions.length === 0) {
            if (context.destination) {
                suggestions = [
                    "Show budget options 💰",
                    "Show luxury options 👑",
                    "What to eat there? 🍽️",
                    "Best time to visit 📅",
                    "Local tips & culture 🏛️",
                ];
            } else {
                suggestions = [
                    "🏖️ Beach vacation",
                    "🏔️ Mountain adventure",
                    "🌍 International trip",
                    "🇮🇳 Explore India",
                ];
            }
        }

        return NextResponse.json({ message: cleanMessage, links, suggestions });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            {
                message: "I'm having a little trouble right now. Please try again! 🙏",
                links: [],
                suggestions: ["Try again", "Start fresh"],
            },
            { status: 200 }
        );
    }
}
