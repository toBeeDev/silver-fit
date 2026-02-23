"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["기초연금", "돌봄서비스", "의료지원", "교통할인", "주거지원"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="flex flex-1 w-full items-center">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-0 px-5 py-12 sm:gap-0 sm:py-0">
        {/* Left column — vertical label + keyword dots (desktop) */}
        <div className="hidden flex-col items-center justify-center border-r border-border pr-16 sm:flex">
          <motion.span
            className="text-xs font-medium uppercase tracking-widest text-sub-text"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            SilverFit
          </motion.span>

          {/* Keyword progress dots */}
          <div className="mt-8 flex flex-col gap-2.5">
            {titles.map((_, i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full"
                animate={{
                  backgroundColor:
                    i === titleNumber
                      ? "var(--color-primary-600)"
                      : "var(--color-border)",
                  scale: i === titleNumber ? 1.3 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Main content — left aligned */}
        <div className="flex-1 sm:pl-16">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
            2026년 최신 복지혜택 정보
          </motion.span>

          <h1 className="mt-6 text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
            어르신을 위한
            <span className="relative block h-[1.4em] overflow-hidden sm:h-[1.3em] md:h-[1.25em]">
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute left-0 font-semibold text-primary-700"
                  initial={{ opacity: 0, y: "-100" }}
                  transition={{ type: "spring", stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-sub-text md:text-lg">
            나이, 지역, 소득만 입력하면 받을 수 있는 혜택을 자동으로
            찾아드립니다. 기초연금부터 돌봄서비스까지, 놓치는 혜택 없이
            챙기세요.
          </p>

          <div className="mt-8 flex flex-row gap-3">
            <Link href="/benefits">
              <Button size="lg" className="gap-4" variant="outline">
                전체 혜택 보기 <MoveRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/recommend">
              <Button size="lg" className="gap-4">
                맞춤 혜택 찾기 <MoveRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators — pill style */}
          <div className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-3">
            {[
              { label: "정부 공식 복지로 데이터" },
              { label: "14종+ 혜택 안내" },
              { label: "무료 서비스" },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-sub-text"
              >
                <span className="h-1 w-1 rounded-full bg-primary-600" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedHero;
export { AnimatedHero };
