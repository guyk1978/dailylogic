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
  title: {
    default: "DailyLogic — Life & Home Tools",
    template: "%s · DailyLogic",
  },
  description:
    "Focused tools for life, home, and personal management — all in your browser.",
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
