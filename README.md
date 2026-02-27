# WanderAI — AI Travel Planning Assistant

An AI-powered travel assistant that helps you plan complete trips through natural conversation. Powered by **Gemini 2.5 Flash** via OpenRouter.

**Live Demo**: [travel-chat-ai-zeta.vercel.app](https://travel-chat-ai-zeta.vercel.app/)

## Features

- **Conversational trip planning** — describe your trip in plain language
- **Real booking links** — flights, hotels, and activities with direct links to 8+ booking sites
- **Context-aware suggestions** — chip suggestions evolve as the conversation progresses
- **Light & dark theme** — toggle in the nav, persisted across sessions
- **Voice input & Emoji engagement** — speak your message; AI responds with engaging emojis
- **Multi-model fallback** — Gemini 2.5 Flash → Gemini 2.0 Flash → Llama 3.3 70B → Mistral 7B
- **Scroll animations & Smooth UI** — refined scrolling and reveal animations

## Booking Sites Supported

| Category | Sites |
|---|---|
| Flights | Google Flights, MakeMyTrip, Skyscanner, Goibibo |
| Hotels | Booking.com, MakeMyTrip, OYO, Agoda, Hotels.com, Goibibo, Cleartrip, Expedia |
| Stays | Airbnb |
| Activities | Viator |
| Maps | Google Maps |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Sudhanshub27/travel-chat-ai.git
cd travel-chat-ai
npm install
```

### 2. Set up environment

Create `.env.local` in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your free API key at [openrouter.ai](https://openrouter.ai).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS custom properties (light/dark themes)
- **AI**: OpenRouter API → Gemini 2.5 Flash
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Project Structure

```
travel-chat-ai/
├── app/
│   ├── api/chat/route.ts    # OpenRouter API integration + fallback chain
│   ├── globals.css          # Design system (light/dark themes, animations)
│   ├── layout.tsx
│   └── page.tsx             # Landing page with scroll animations
├── components/
│   ├── ChatInterface.tsx    # Main chat UI
│   ├── ChatMessage.tsx      # Message bubbles + formatting
│   └── LinkCards.tsx        # Booking link cards
└── types/
    └── travel.ts            # TypeScript types
```

## Landing Page Sections

1. **Hero** — two-column layout with live chat preview cycling destinations
2. **Destinations** — auto-scrolling strip of popular travel spots
3. **Features** — 6-card grid covering what WanderAI does
4. **How it works** — 3-step guide
5. **CTA Banner** — call to action with gradient background

## Environment Variables

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key (required) |
