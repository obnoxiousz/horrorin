"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Threshold navbar — ubah nilainya di sini.
 * - TOP_OFFSET : scrollY di bawah nilai ini → navbar selalu visible.
 * - HIDE_AFTER : navbar baru boleh hide setelah scrollY melewati nilai ini.
 * - DELTA      : minimal beda scroll per frame sebelum arah dianggap sengaja.
 */
const TOP_OFFSET = 8;
const HIDE_AFTER = 80;
const DELTA = 8;

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function clampScroll(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export function useNavbarVisibility() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isHoverCapable, setIsHoverCapable] = useState(false);

  const lastScrollYRef = useRef(0);
  const isVisibleRef = useRef(true);
  const hoverActiveRef = useRef(false);
  const lockedRef = useRef(false);
  const scrollFrameRef = useRef<number | null>(null);
  const releaseFrameRef = useRef<number | null>(null);

  const apply = useCallback((next: boolean) => {
    if (isVisibleRef.current === next) return;
    isVisibleRef.current = next;
    setIsVisible(next);
  }, []);

  const evaluate = useCallback(
    (currentY: number, delta: number) => {
      if (currentY <= TOP_OFFSET) {
        apply(true);
        return;
      }
      if (lockedRef.current || hoverActiveRef.current) {
        apply(true);
        return;
      }
      // scroll ke atas (dengan delta meyakinkan) → selalu munculkan
      if (delta <= -DELTA) {
        apply(true);
        return;
      }
      // scroll ke bawah (dengan delta meyakinkan) setelah threshold → sembunyikan;
      // di antara dua threshold biarkan kondisi terakhir.
      if (delta >= DELTA && currentY > HIDE_AFTER) {
        apply(false);
        return;
      }
    },
    [apply]
  );

  // Evaluasi ulang saat hover/fokus berhenti atau dropdown/menu ditutup.
  const reevaluateOnRelease = useCallback(
    (currentY: number) => {
      if (currentY <= TOP_OFFSET) {
        apply(true);
        return;
      }
      if (currentY > HIDE_AFTER && !hoverActiveRef.current && !lockedRef.current) {
        apply(false);
        return;
      }
    },
    [apply]
  );

  const setHoverZoneActive = useCallback(
    (value: boolean) => {
      hoverActiveRef.current = value;
      if (value) {
        if (releaseFrameRef.current !== null) {
          cancelAnimationFrame(releaseFrameRef.current);
          releaseFrameRef.current = null;
        }
        apply(true);
        return;
      }
      // Tunda evaluasi ke rAF berikutnya supaya handover mousenter/focus
      // (mis. blur lalu langsung focus ke elemen navbar lain) tidak flicker.
      if (releaseFrameRef.current !== null) return;
      releaseFrameRef.current = requestAnimationFrame(() => {
        releaseFrameRef.current = null;
        if (hoverActiveRef.current) return;
        reevaluateOnRelease(clampScroll(window.scrollY));
      });
    },
    [apply, reevaluateOnRelease]
  );

  const setLocked = useCallback(
    (value: boolean) => {
      lockedRef.current = value;
      if (value) {
        if (releaseFrameRef.current !== null) {
          cancelAnimationFrame(releaseFrameRef.current);
          releaseFrameRef.current = null;
        }
        apply(true);
        return;
      }
      reevaluateOnRelease(clampScroll(window.scrollY));
    },
    [apply, reevaluateOnRelease]
  );

  // Scroll listener + throttle via rAF.
  useEffect(() => {
    lastScrollYRef.current = clampScroll(window.scrollY);

    const onScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const currentY = clampScroll(window.scrollY);
        const delta = currentY - lastScrollYRef.current;
        lastScrollYRef.current = currentY;
        evaluate(currentY, delta);
      });
    };

    const onReflow = () => evaluate(clampScroll(window.scrollY), 0);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onReflow);
    window.addEventListener("orientationchange", onReflow);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("orientationchange", onReflow);
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
      if (releaseFrameRef.current !== null) cancelAnimationFrame(releaseFrameRef.current);
      scrollFrameRef.current = null;
      releaseFrameRef.current = null;
    };
  }, [evaluate]);

  // Pindah route: reset lastScrollY dan evaluasi ulang (at top → visible).
  useEffect(() => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
    lastScrollYRef.current = clampScroll(window.scrollY);
    evaluate(lastScrollYRef.current, 0);
  }, [pathname, evaluate]);

  // Hover-capable hanya di device desktop (pointer fungsional), bukan ukuran layar.
  useEffect(() => {
    const mql = window.matchMedia(HOVER_QUERY);
    const sync = () => setIsHoverCapable(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return { isVisible, setHoverZoneActive, setLocked, isHoverCapable } as const;
}
