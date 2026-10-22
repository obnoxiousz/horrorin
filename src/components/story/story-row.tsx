"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryRowProps {
  children: ReactNode;
  className?: string;
}

export function StoryRow({ children, className }: StoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClasses =
    "hidden [@media(hover:hover)]:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur border border-white/10 hover:bg-black/90 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity";

  return (
    <div className="relative group/row">
      <div
        ref={scrollRef}
        onScroll={update}
        className={cn(
          "flex gap-3 sm:gap-4 overflow-x-auto snap-x [@media(hover:hover)]:snap-proximity snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-px-4 sm:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
      >
        {Children.map(children, (child, i) =>
          child == null ? null : (
            <div
              key={i}
              className="snap-start shrink-0 w-[72vw] max-w-[300px] sm:w-64 md:w-72"
            >
              {child}
            </div>
          )
        )}
      </div>
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className={cn(arrowClasses, "left-2")}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className={cn(arrowClasses, "right-2")}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
