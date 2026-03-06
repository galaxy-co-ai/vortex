import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vortex — Live Tornado Tracker",
  description:
    "Real-time tornado and severe weather tracking. Live NEXRAD radar, NWS warnings, SPC outlooks, and storm reports on an interactive map.",
  keywords: [
    "tornado tracker",
    "severe weather",
    "storm tracking",
    "NEXRAD radar",
    "tornado warning",
    "Moore Oklahoma",
    "storm spotter",
  ],
  openGraph: {
    title: "Vortex — Live Tornado Tracker",
    description:
      "Real-time tornado and severe weather tracking with live radar, warning polygons, and storm reports.",
    type: "website",
    siteName: "Vortex",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
