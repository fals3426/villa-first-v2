import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { BfCacheOptimizer } from "@/components/providers/BfCacheOptimizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Évite le FOIT (Flash of Invisible Text) - améliore LCP
  preload: true, // Précharge la font critique
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Évite le FOIT
  preload: false, // Font moins critique, chargée en arrière-plan
});

export const metadata: Metadata = {
  title: "Villa first - Colocations vérifiées à Bali",
  description: "Marketplace de mise en relation pour colocations vérifiées à Bali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <BfCacheOptimizer />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
