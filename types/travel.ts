export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    links?: TravelLink[];
    suggestions?: string[];
}

export interface TravelLink {
    label: string;
    url: string;
    icon: string;
    category: "flight" | "hotel" | "stay" | "activity" | "map";
    description?: string;
}

export interface TravelContext {
    destination?: string;
    origin?: string;
    budget?: "budget" | "mid-range" | "luxury";
    people?: number;
    duration?: string;
    departureDate?: string;
    returnDate?: string;
    travelStyle?: string[];
    preferences?: string[];
    phase:
    | "greeting"
    | "collecting_destination"
    | "collecting_origin"
    | "collecting_dates"
    | "collecting_people"
    | "collecting_budget"
    | "collecting_style"
    | "suggesting"
    | "followup";
}

export interface ChatResponse {
    message: string;
    links?: TravelLink[];
    suggestions?: string[];
    context?: Partial<TravelContext>;
}

/* ── Itinerary types ── */
export type ActivityType = "flight" | "hotel" | "food" | "activity" | "transport" | "note";

export interface ItineraryActivity {
    id: string;
    type: ActivityType;
    title: string;
    time?: string;
    description?: string;
    link?: string;
}

export interface ItineraryDay {
    id: string;
    day: number;
    label?: string;   // "Day 1 — Arrival" etc.
    activities: ItineraryActivity[];
}

export interface Itinerary {
    destination?: string;
    days: ItineraryDay[];
}
