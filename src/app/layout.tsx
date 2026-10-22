import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { RouteTransition } from "@/components/ui/route-transition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horrorin — Komunitas Cerita Horror Paling Ngeri di Indonesia",
  description:
    "Bikin cerita horror kek pros. Pilih template, edit konten, tayangin ke ribuan pembaca. Tempatnya urban legend, pengalaman gaib, dan misteri Indonesia.",
  keywords: ["horror", "cerita horror", "urban legend", "indonesia", "mistis", "gaib", "horrorin"],
  authors: [{ name: "Horrorin" }],
  openGraph: {
    title: "Horrorin",
    description: "Bikin cerita horror kek pros. Pilih template, edit konten, tayangin.",
    siteName: "Horrorin",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <Suspense fallback={null}>
            <RouteTransition />
          </Suspense>
          {children}
        </Providers>
        <Toaster />
        <Sonner position="top-right" theme="dark" />
      </body>
    </html>
  );
}
