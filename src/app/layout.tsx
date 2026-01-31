import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lyceum.ai";

export const metadata: Metadata = {
  title: {
    default: "AI Coding Lyceum",
    template: "%s | AI Coding Lyceum",
  },
  description: "Your community for AI coding education, practice, and creation. Learn AI tools, take courses, practice coding, and share your projects.",
  keywords: [
    "AI",
    "coding",
    "education",
    "programming",
    "machine learning",
    "courses",
    "Claude",
    "GPT",
    "LLM",
    "prompt engineering",
    "AI tools",
    "MCP",
    "agents",
  ],
  authors: [{ name: "AI Coding Lyceum" }],
  creator: "AI Coding Lyceum",
  publisher: "AI Coding Lyceum",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AI Coding Lyceum",
    title: "AI Coding Lyceum",
    description: "Your community for AI coding education, practice, and creation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Coding Lyceum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Coding Lyceum",
    description: "Your community for AI coding education, practice, and creation.",
    images: ["/og-image.png"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
