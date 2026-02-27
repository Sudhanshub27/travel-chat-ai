# ✈️ WanderAI

A full-stack AI-powered travel planning application that helps users draft perfect itineraries, find real booking links, and explore destinations—all through natural conversation.

WanderAI handles the research so you can focus on the journey. No sign-up, no credit card—just talk and travel.

---

## 🌐 Live Demo

*   **Website**: [travel-chat-ai-zeta.vercel.app](https://travel-chat-ai-zeta.vercel.app/)

---

## ✨ Key Features

*   **AI-Powered Itineraries**: Transform brief travel ideas into detailed day-by-day plans using Gemini 2.5 Flash.
*   **Real Booking Links**: Integrated search for flights, hotels, and activities across 8+ global providers.
*   **Dynamic Context**: The AI learns your preferences (budget, style, group size) as the conversation evolves.
*   **Itinerary Builder**: Interactive side panel to view, edit, and copy your generated trip plans instantly.
*   **Responsive & Smooth**: Fully optimized for mobile browsers with modern scroll behavior and reveal animations.
*   **Voice Input**: Speak your travel dreams directly to the AI for a truly conversational experience.
*   **Light & Dark Mode**: Beautifully crafted themes that persist across your sessions.

---

## 🏗️ Tech Stack

*   **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS, Lucide React.
*   **Backend**: Next.js API Routes (Serverless).
*   **AI Engine**: OpenRouter API (Gemini 2.5 Flash + fallbacks).
*   **Deployment**: Vercel.

---

## 🚀 Local Setup

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/Sudhanshub27/travel-chat-ai.git
cd travel-chat-ai
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure Environment Variables:**
Create a `.env.local` file in the project root:
```env
OPENROUTER_API_KEY=your_key_here
```

**4. Run the development server:**
```bash
npm run dev
```

---

## 📂 Project Structure

```
travel-chat-ai/
├── app/
│   ├── api/chat/route.ts    # AI Logic & Fallback Chain
│   ├── globals.css          # Design System & Themes
│   ├── layout.tsx           # Global Layout
│   └── page.tsx             # Landing Page
├── components/
│   ├── ChatInterface.tsx    # Responsive Chat Core
│   ├── ItineraryBuilder.tsx # Dynamic Trip Manager
│   └── ChatMessage.tsx      # Interactive Bubbles
├── types/                   # TypeScript Definitions
└── README.md                # Documentation
```

---

## 🧠 Design Philosophy

This project prioritizes high-quality UX and user empowerment:
*   **Simplicity**: Planning a trip should be as easy as sending a text.
*   **Utility**: We provide real links, not just suggestions—making action immediate.
*   **Engagement**: Rich emojis and smooth animations make the planning process as fun as the trip itself.

---

## 📄 License

MIT License — feel free to use and modify for your own projects!
