# ✈️ WanderAI — AI-Powered Travel Chat

> Plan your dream trip through natural conversation. Get flights, hotels, and stay recommendations with real booking links — all in one place.

![WanderAI](https://img.shields.io/badge/WanderAI-Travel%20AI-blue?style=for-the-badge&logo=airplane)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)

## 🌍 What is WanderAI?

WanderAI is an **all-in-one travel planning chat** where you simply talk (or type!) about your travel dreams. The AI gathers your preferences and instantly generates:

- ✈️ **Flight links** — Google Flights, MakeMyTrip, Skyscanner
- 🏨 **Hotel suggestions** — Booking.com, Hotels.com, MakeMyTrip Hotels
- 🏠 **Unique stays** — Airbnb, StayVista, Club Mahindra
- 🎯 **Activities** — Viator, GetYourGuide
- 🗺️ **Itinerary ideas** — Personalized based on budget & style

## 🚀 Features

- 💬 **Conversational AI** — Natural chat interface powered by Google Gemini
- 🎤 **Voice Input** — Speak your travel plans (browser-based, no extra setup)
- 🔊 **Voice Responses** — AI reads responses aloud (toggle on/off)
- 🔗 **Real Booking Links** — Direct links to actual booking sites
- 💰 **Budget Aware** — Budget, Mid-range, or Luxury recommendations
- 📍 **Context Tracking** — Remembers destination, dates, people count throughout
- 🌙 **Beautiful Dark UI** — Glassmorphism design with animations

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| AI | Google Gemini 2.0 Flash |
| Voice | Web Speech API (browser native) |
| Deployment | Vercel (recommended) |

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/travel-chat-ai.git
cd travel-chat-ai
npm install
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Get API key** → **Create API key**
3. Copy your key

### 3. Set Environment Variable
Create `.env.local` in the project root:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add `GEMINI_API_KEY` in Vercel dashboard under **Settings → Environment Variables**.

## 📱 How to Use

1. **Open the app** and click "Start Planning for Free"
2. **Tell WanderAI** where you want to go (type or use 🎤 voice)
3. **Answer questions** about dates, budget, number of people, travel style
4. **Get recommendations** with clickable links to book directly
5. **Use quick chips** for fast replies or follow-up questions

## 🗺️ Roadmap

- [ ] User authentication & saved trips
- [ ] In-app itinerary builder
- [ ] Price comparison integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Direct booking integration

## 📄 License

MIT License — feel free to build on this!

---

Built with ❤️ using Next.js + Google Gemini AI
