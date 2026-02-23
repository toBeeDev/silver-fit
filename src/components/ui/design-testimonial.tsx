"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const testimonials = [
  {
    quote: "기초연금 신청 방법을 몰랐는데, 한번에 찾을 수 있었어요.",
    author: "김영숙",
    role: "72세, 서울 거주",
    tag: "기초연금",
  },
  {
    quote: "손주가 알려준 사이트인데, 혜택을 이렇게 쉽게 찾다니 놀랐어요.",
    author: "박정호",
    role: "68세, 부산 거주",
    tag: "돌봄서비스",
  },
  {
    quote: "여러 사이트 돌아다닐 필요 없이 여기서 다 해결됐습니다.",
    author: "이순자",
    role: "75세, 대구 거주",
    tag: "의료지원",
  },
];

export function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };

  const goNext = () =>
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const goPrev = () =>
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <div className="flex flex-1 items-center justify-center overflow-hidden px-5">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl"
        onMouseMove={handleMouseMove}
      >
        {/* Oversized index number */}
        <motion.div
          className="pointer-events-none absolute -left-8 top-1/2 hidden -translate-y-1/2 select-none text-[28rem] font-bold leading-none tracking-tighter text-foreground/[0.03] sm:block"
          style={{ x: numberX, y: numberY }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Main content */}
        <div className="relative flex">
          {/* Left column - vertical text (desktop only) */}
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
              이용후기
            </motion.span>

            {/* Vertical progress line */}
            <div className="relative mt-8 h-32 w-px bg-border">
              <motion.div
                className="absolute left-0 top-0 w-full origin-top bg-foreground"
                animate={{
                  height: `${((activeIndex + 1) / testimonials.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* Center - main content */}
          <div className="flex-1 py-8 sm:py-12 sm:pl-16">
            {/* Tag badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                  {current.tag}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Quote with word reveal */}
            <div className="relative mb-8 min-h-[80px] sm:mb-12 sm:min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={activeIndex}
                  className="text-[22px] font-normal leading-[1.35] tracking-tight text-foreground sm:text-[28px] sm:leading-[1.3] md:text-5xl md:leading-[1.15]"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {current.quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className="mr-[0.3em] inline-block"
                      variants={{
                        hidden: { opacity: 0, y: 20, rotateX: 90 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          transition: {
                            duration: 0.5,
                            delay: i * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                        exit: {
                          opacity: 0,
                          y: -10,
                          transition: { duration: 0.2, delay: i * 0.02 },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Author row */}
            <div className="flex items-end justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    className="h-px w-8 bg-foreground"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ originX: 0 }}
                  />
                  <div>
                    <p className="text-base font-medium text-foreground">
                      {current.author}
                    </p>
                    <p className="text-sm text-sub-text">{current.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                  onClick={goPrev}
                  className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border sm:h-12 sm:w-12"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-foreground transition-colors"
                  >
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={goNext}
                  className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border sm:h-12 sm:w-12"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-foreground transition-colors"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="pointer-events-none absolute -bottom-16 left-0 right-0 overflow-hidden opacity-[0.06]">
          <motion.div
            className="flex whitespace-nowrap text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            animate={{ x: [0, -1000] }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-8">
                기초연금 &bull; 돌봄서비스 &bull; 의료지원 &bull; 교통할인
                &bull; 주거지원 &bull;
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
