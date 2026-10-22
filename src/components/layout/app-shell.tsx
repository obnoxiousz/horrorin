import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { PageTransition } from "@/components/ui/page-transition";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Navbar sudah floating (fixed) dan tidak lagi menghabiskan ruang di flow;
          pt-20 memberi ruang untuk pill (top-4 + h-14 = 72px) supaya konten
          teratas tidak tertutup navbar. */}
      <main className="flex-1 pt-20">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
