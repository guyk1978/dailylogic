import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocaleBootstrapScript } from "@/lib/i18n/locale-bootstrap";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dailylogic.app"),
  applicationName: "DailyLogic",
  title: {
    default: "DailyLogic — Life & Home Tools",
    template: "%s · DailyLogic",
  },
  description:
    "Focused tools for life, home, and personal management — all in your browser.",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    title: "DailyLogic",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getLocaleBootstrapScript() }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 font-sans text-slate-800 antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
