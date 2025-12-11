import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Forge - Time Tracking & Productivity Made Simple",
  description:
    "A lightweight desktop productivity application that helps you track time and forge better focus habits. Built with Electron, React, and Supabase.",
  keywords: [
    "time tracking",
    "productivity",
    "focus",
    "desktop app",
    "electron",
    "time management",
    "work tracker",
    "focus timer",
    "productivity tool",
  ],
  authors: [{ name: "Focus Forge Team" }],
  creator: "Focus Forge",
  publisher: "Focus Forge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://focus-forge.dev",
    title: "Focus Forge - Time Tracking & Productivity Made Simple",
    description:
      "A lightweight desktop productivity application that helps you track time and forge better focus habits. Built with Electron, React, and Supabase.",
    siteName: "Focus Forge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Forge - Time Tracking & Productivity Made Simple",
    description:
      "A lightweight desktop productivity application that helps you track time and forge better focus habits.",
    creator: "@focusforge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
