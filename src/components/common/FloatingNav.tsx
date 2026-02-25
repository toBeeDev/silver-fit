"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface FloatingNavProps {
  items: FloatingNavItem[];
  headerHeight?: number;
}

export default function FloatingNav({
  items,
  headerHeight = 64,
}: FloatingNavProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 400);

    let current = "";
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= headerHeight + 36) {
        current = item.id;
      }
    }
    setActiveSection(current);
  }, [items, headerHeight]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="fixed right-4 top-1/2 z-40 -translate-y-1/2 lg:right-6 xl:right-8">
      <nav className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-white/90 p-1.5 shadow-lg backdrop-blur-sm sm:p-2">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "flex w-full items-center rounded-xl p-2.5 transition-all sm:gap-2 sm:px-3 sm:py-2",
                isActive
                  ? "bg-primary-700 text-white shadow-sm"
                  : "text-sub-text hover:bg-gray-100 hover:text-foreground",
              )}
              aria-label={item.label}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden text-[12px] font-medium sm:block">
                {item.label}
              </span>
            </button>
          );
        })}

        {showScrollTop && (
          <>
            <div className="mx-auto my-0.5 h-px w-6 bg-border/60" />
            <button
              type="button"
              onClick={scrollToTop}
              className="flex w-full items-center rounded-xl p-2.5 text-sub-text transition-all hover:bg-gray-100 hover:text-foreground sm:gap-2 sm:px-3 sm:py-2"
              aria-label="맨 위로"
            >
              <span className="shrink-0">
                <ArrowUp className="h-4 w-4" />
              </span>
              <span className="hidden text-[12px] font-medium sm:block">
                맨 위로
              </span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
