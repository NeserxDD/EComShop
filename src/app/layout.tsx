import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
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
  title: { default: "EComShop — Computer Store & Repair", template: "%s | EComShop" },
  description:
    "Browse components, laptops & peripherals. Request computer repair and track status. $0 free-tier stack: Next.js + Supabase + Cloudinary.",
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
