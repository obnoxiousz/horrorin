"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 300;
const SAFETY_TIMEOUT_MS = 8000;
const FADE_MS = 200;

let triggerStart: (() => void) | null = null;

export function useRouteTransition() {
  const start = useCallback(() => triggerStart?.(), []);
  return { start };
}

type Phase = "idle" | "pending" | "visible" | "leaving";

export function RouteTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");

  const phaseRef = useRef<Phase>("idle");
  const shownAtRef = useRef(0);
  const locationRef = useRef<string | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = (ref: typeof showTimerRef) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };
  const clearAllTimers = () => {
    clearTimer(showTimerRef);
    clearTimer(hideTimerRef);
    clearTimer(safetyTimerRef);
  };

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const beginLeave = useCallback(() => {
    clearAllTimers();
    setPhaseSafe("leaving");
    hideTimerRef.current = setTimeout(() => setPhaseSafe("idle"), FADE_MS);
  }, [setPhaseSafe]);

  const start = useCallback(() => {
    if (phaseRef.current === "pending" || phaseRef.current === "visible") return;
    clearAllTimers();
    setPhaseSafe("pending");
    showTimerRef.current = setTimeout(() => {
      setPhaseSafe("visible");
      shownAtRef.current = Date.now();
    }, SHOW_DELAY_MS);
    safetyTimerRef.current = setTimeout(() => {
      beginLeave();
    }, SAFETY_TIMEOUT_MS);
  }, [beginLeave, setPhaseSafe]);

  useEffect(() => {
    triggerStart = start;
    return () => {
      triggerStart = null;
    };
  }, [start]);

  useEffect(() => {
    const qs = searchParams.toString();
    const loc = pathname + (qs ? `?${qs}` : "");
    const prev = locationRef.current;
    locationRef.current = loc;
    if (prev === null || prev === loc) return;
    if (phaseRef.current === "pending") {
      clearAllTimers();
      setPhaseSafe("idle");
    } else if (phaseRef.current === "visible") {
      const elapsed = Date.now() - shownAtRef.current;
      hideTimerRef.current = setTimeout(
        beginLeave,
        Math.max(0, MIN_VISIBLE_MS - elapsed),
      );
    }
  }, [pathname, searchParams, beginLeave, setPhaseSafe]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!e.defaultPrevented) return;
      const anchor =
        e.target instanceof Element
          ? (e.target.closest("a[href]") as HTMLAnchorElement | null)
          : null;
      if (!anchor) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (anchor.hasAttribute("download")) return;
      if ((anchor.getAttribute("rel") ?? "").split(/\s+/).includes("external")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (/^(mailto|tel|javascript|blob|data):/i.test(url.protocol)) return;
      const current = window.location.pathname + window.location.search;
      if (url.pathname + url.search === current) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [start]);

  if (phase === "idle" || phase === "pending") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity",
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <span className="sr-only">Lagi pindah halaman...</span>
      <Image
        src="/assets/logo.svg"
        alt=""
        width={1000}
        height={1000}
        priority
        className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse motion-reduce:animate-none"
      />
    </div>
  );
}
