import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Komodo Hub",
  description: "Conservation learning, reporting, and community programmes for Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider>
          <AppHeader />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-zinc-200/70 bg-white/70 py-8 text-center text-sm text-zinc-600 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70 dark:text-zinc-400">
            Komodo Hub — conservation education and reporting
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
