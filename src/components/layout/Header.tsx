"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/benefits", label: "복지혜택" },
  { href: "/analysis", label: "검진결과분석" },
  { href: "/insurance", label: "보험상품찾기" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.style.cssText =
      "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);


  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        menuOpen ? "bg-background" : scrolled ? "backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
        aria-label="메인 네비게이션"
      >
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:rounded-sm"
        >
          <span className="logo-silver text-[19px] font-semibold tracking-[-0.02em]">
            SilverFit
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-3 text-[15px]",
                    isActive
                      ? "text-primary-700 font-semibold"
                      : "text-sub-text",
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={toggleMenu}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-primary-50 sm:hidden"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <div
        className={cn(
          "overflow-hidden border-b border-border bg-background transition-all duration-300 ease-in-out sm:hidden",
          menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 border-transparent",
        )}
      >
        <div className="flex flex-col gap-1 px-5 pb-4 pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-sub-text hover:bg-primary-50/50 hover:text-foreground",
                )}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
