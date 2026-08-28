import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Stone & Circuit — Computer Store & Care", template: "%s | Stone & Circuit" },
  description:
    "Official storefront & authorized repair for laptops, components & peripherals. Genuine parts. Expert care. Manila — warranty on every fix.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Theme init script to avoid FOUC — reads localStorage "ecomshop-theme" or system
  const themeScript = `
    try {
      const s = localStorage.getItem('ecomshop-theme');
      const m = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const d = s ? s === 'dark' : m;
      document.documentElement.classList.toggle('dark', d);
    } catch {}
  `;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme" strategy="beforeInteractive" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
