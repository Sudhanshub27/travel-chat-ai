import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WanderAI — Your AI Travel Companion",
  description:
    "Plan your perfect trip with WanderAI. Tell us your destination, budget, and travel style — we'll suggest flights, hotels, and stays with direct booking links. All in one place.",
  keywords: "travel planner, AI travel assistant, flight search, hotel booking, trip planning",
  openGraph: {
    title: "WanderAI — Your AI Travel Companion",
    description: "Plan your perfect trip with conversational AI. Flights, hotels, and stays — all in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
