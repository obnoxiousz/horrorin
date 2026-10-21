import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
