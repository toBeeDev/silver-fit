"use client";

import { memo, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsuranceProduct } from "@/types/insurance";

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  productA: InsuranceProduct;
  productB: InsuranceProduct;
}

interface CompareRow {
  label: string;
  valueA: number | null;
  valueB: number | null;
  unit: string;
  higherIsBetter: boolean;
}

function parseGuarRate(raw: string): number | null {
  const match = raw.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : null;
}

function fmt(v: number | null, unit: string): string {
  if (v == null) return "0.00%";
  return `${v.toFixed(2)}${unit}`;
}

export default function CompareModal({
  open,
  onClose,
  productA,
  productB,
}: CompareModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  const rows: CompareRow[] = [
    { label: "평균수익률", valueA: productA.avgPrftRate, valueB: productB.avgPrftRate, unit: "%", higherIsBetter: true },
    { label: "1년 수익률", valueA: productA.btrmPrftRate1, valueB: productB.btrmPrftRate1, unit: "%", higherIsBetter: true },
    { label: "2년 수익률", valueA: productA.btrmPrftRate2, valueB: productB.btrmPrftRate2, unit: "%", higherIsBetter: true },
    { label: "3년 수익률", valueA: productA.btrmPrftRate3, valueB: productB.btrmPrftRate3, unit: "%", higherIsBetter: true },
    { label: "공시이율", valueA: productA.dclsRate, valueB: productB.dclsRate, unit: "%", higherIsBetter: true },
    { label: "최저보증이율", valueA: parseGuarRate(productA.guarRate), valueB: parseGuarRate(productB.guarRate), unit: "%", higherIsBetter: true },
  ];

  const logoA = `/images/company/${productA.finCoNo}.png`;
  const logoB = `/images/company/${productB.finCoNo}.png`;
  const typeA = productA.coverage.split(" / ")[1] ?? productA.coverage;
  const typeB = productB.coverage.split(" / ")[1] ?? productB.coverage;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 px-0 backdrop-blur-sm sm:items-start sm:px-4 sm:py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[680px] rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-sub-text transition-colors hover:bg-gray-100 sm:right-4 sm:top-4 sm:p-2"
              aria-label="닫기"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* 제목 */}
            <div className="px-(--space-page-x) pt-6 pb-1 sm:pt-8 sm:pb-2">
              <h2 className="text-center text-(--text-section-title) font-bold text-foreground">
                연금저축 상품 비교
              </h2>
            </div>

            {/* 로고 + VS + 회사/상품명 */}
            <div className="flex items-center px-3 py-4 sm:px-6 sm:py-6">
              {/* A */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <Image
                  src={logoA}
                  alt={productA.companyName}
                  width={80}
                  height={80}
                  className="h-[48px] w-[48px] rounded-full sm:h-[80px] sm:w-[80px]"
                />
                <p className="mt-2 text-(--text-label) font-semibold text-foreground sm:mt-3">
                  {productA.companyName}
                </p>
                <p className="mt-0.5 line-clamp-2 px-1 text-(--text-caption) leading-snug text-sub-text">
                  {productA.productName}
                </p>
              </div>

              {/* VS */}
              <span className="shrink-0 px-2 text-(--text-section-title) font-bold text-foreground/60 sm:px-5">
                VS
              </span>

              {/* B */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <Image
                  src={logoB}
                  alt={productB.companyName}
                  width={80}
                  height={80}
                  className="h-[48px] w-[48px] rounded-full sm:h-[80px] sm:w-[80px]"
                />
                <p className="mt-2 text-(--text-label) font-semibold text-foreground sm:mt-3">
                  {productB.companyName}
                </p>
                <p className="mt-0.5 line-clamp-2 px-1 text-(--text-caption) leading-snug text-sub-text">
                  {productB.productName}
                </p>
              </div>
            </div>

            {/* 비교 행 */}
            <div className="px-3 sm:px-6">
              {rows.map((row) => (
                <CompareRowItem key={row.label} row={row} />
              ))}
            </div>

            {/* 조건 태그 */}
            <div className="flex items-center border-t border-border px-3 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-1 sm:gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-(--text-caption) text-sub-text">
                  {productA.category}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-(--text-caption) text-sub-text">
                  {typeA}
                </span>
              </div>
              <span className="shrink-0 px-2 text-(--text-caption) font-medium text-sub-text sm:px-3">
                조건
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-1 sm:gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-(--text-caption) text-sub-text">
                  {productB.category}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-(--text-caption) text-sub-text">
                  {typeB}
                </span>
              </div>
            </div>

            {/* 면책 */}
            <div className="px-(--space-page-x) pb-6">
              <p className="text-center text-(--text-caption) text-sub-text">
                * 금감원 금융상품한눈에 공시 데이터 기준. 실제 수익률은 다를 수 있습니다.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CompareRowItem = memo(function CompareRowItem({ row }: { row: CompareRow }) {
  const { label, valueA, valueB, unit, higherIsBetter } = row;
  const a = valueA ?? 0;
  const b = valueB ?? 0;

  let winnerSide: "a" | "b" | "tie" = "tie";
  if (a !== b) {
    if (a > b) winnerSide = higherIsBetter ? "a" : "b";
    else winnerSide = higherIsBetter ? "b" : "a";
  }

  const maxAbs = Math.max(Math.abs(a), Math.abs(b), 0.01);
  const barA = (Math.abs(a) / maxAbs) * 100;
  const barB = (Math.abs(b) / maxAbs) * 100;

  return (
    <div className="flex items-center gap-1 py-2 sm:gap-3 sm:py-2.5">
      {/* A값 (모바일) */}
      <span className={`w-[52px] shrink-0 text-right text-(--text-label) font-bold tabular-nums sm:hidden ${
        winnerSide === "a" ? "text-blue-600" : "text-red-400"
      }`}>
        {fmt(valueA, unit)}
      </span>

      {/* A: 바 (데스크탑 — 값 포함) */}
      <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 sm:flex">
        <div className="h-[30px] flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`ml-auto flex h-full items-center justify-start rounded-full pl-3 ${
              winnerSide === "a" ? "bg-blue-400" : "bg-red-300"
            }`}
            style={{ width: `${Math.max(barA, 22)}%` }}
          >
            <span className="whitespace-nowrap text-(--text-label) font-bold text-white">
              {fmt(valueA, unit)}
            </span>
          </div>
        </div>
      </div>

      {/* A: 바 (모바일 — 바만) */}
      <div className="flex min-w-0 flex-1 items-center sm:hidden">
        <div className="h-[20px] w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`ml-auto h-full rounded-full ${
              winnerSide === "a" ? "bg-blue-400" : "bg-red-300"
            }`}
            style={{ width: `${Math.max(barA, 12)}%` }}
          />
        </div>
      </div>

      {/* 라벨 */}
      <span className="w-[52px] shrink-0 text-center text-(--text-caption) font-medium leading-tight text-sub-text sm:w-[100px]">
        {label}
      </span>

      {/* B: 바 (데스크탑 — 값 포함) */}
      <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
        <div className="h-[30px] flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`flex h-full items-center justify-start rounded-full pl-3 ${
              winnerSide === "b" ? "bg-blue-400" : "bg-red-300"
            }`}
            style={{ width: `${Math.max(barB, 22)}%` }}
          >
            <span className="whitespace-nowrap text-(--text-label) font-bold text-white">
              {fmt(valueB, unit)}
            </span>
          </div>
        </div>
      </div>

      {/* B: 바 (모바일 — 바만) */}
      <div className="flex min-w-0 flex-1 items-center sm:hidden">
        <div className="h-[20px] w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${
              winnerSide === "b" ? "bg-blue-400" : "bg-red-300"
            }`}
            style={{ width: `${Math.max(barB, 12)}%` }}
          />
        </div>
      </div>

      {/* B값 (모바일) */}
      <span className={`w-[52px] shrink-0 text-left text-(--text-label) font-bold tabular-nums sm:hidden ${
        winnerSide === "b" ? "text-blue-600" : "text-red-400"
      }`}>
        {fmt(valueB, unit)}
      </span>
    </div>
  );
});
