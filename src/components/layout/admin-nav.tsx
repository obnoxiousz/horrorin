"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stories", label: "Cerita", icon: FileText },
  { href: "/admin/reports", label: "Laporan", icon: Flag },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      {/* Desktop sidebar nav (horizontal pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-thin">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>
        <div className="w-px h-6 bg-border shrink-0" />
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all shrink-0",
                active
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground hover:glass-strong"
              )}
            >
              <Icon className="w-4 h-4" /> {link.label}
            </Link>
          );
        })}
        <div className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs text-primary font-semibold shrink-0">
          <Shield className="w-3.5 h-3.5" /> ADMIN PANEL
        </div>
      </div>
    </div>
  );
}
