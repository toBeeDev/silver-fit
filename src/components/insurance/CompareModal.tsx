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
    {
      label: "평균수익률",
      valueA: productA.avgPrftRate,
      valueB: productB.avgPrftRate,
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "1년전 기준 수익률",
      valueA: productA.btrmPrftRate1,
      valueB: productB.btrmPrftRate1,
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "2년전 기준 수익률",
      valueA: productA.btrmPrftRate2,
      valueB: productB.btrmPrftRate2,
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "3년전 기준 수익률",
      valueA: productA.btrmPrftRate3,
      valueB: productB.btrmPrftRate3,
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "공시이율",
      valueA: productA.dclsRate,
      valueB: productB.dclsRate,
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "최저보증이율",
      valueA: parseGuarRate(productA.guarRate),
      valueB: parseGuarRate(productB.guarRate),
      unit: "%",
      higherIsBetter: true,
    },
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
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[680px] rounded-2xl bg-white shadow-2xl"
          >
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-sub-text transition-colors hover:bg-gray-100"
              aria-label="닫기"
            >
              <X className="h-6 w-6" />
            </button>

            {/* 제목 */}
            <div className="px-6 pt-8 pb-2">
              <h2 className="text-center text-[24px] font-bold text-foreground">
                연금저축 상품 비교
              </h2>
            </div>

            {/* 로고 + VS + 회사/상품명 */}
            <div className="flex items-center px-6 py-6">
              {/* A */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <Image
                  src={logoA}
                  alt={productA.companyName}
                  width={80}
                  height={80}
                  className="h-[72px] w-[72px] rounded-full sm:h-[88px] sm:w-[88px]"
                />
                <p className="mt-3 text-[15px] font-semibold text-foreground sm:text-[16px]">
                  {productA.companyName}
                </p>
                <p className="mt-0.5 line-clamp-2 px-2 text-[13px] leading-snug text-sub-text">
                  {productA.productName}
                </p>
              </div>

              {/* VS */}
              <span className="shrink-0 px-3 text-[28px] font-bold text-foreground/60 sm:px-5 sm:text-[36px]">
                VS
              </span>

              {/* B */}
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <Image
                  src={logoB}
                  alt={productB.companyName}
                  width={80}
                  height={80}
                  className="h-[72px] w-[72px] rounded-full sm:h-[88px] sm:w-[88px]"
                />
                <p className="mt-3 text-[15px] font-semibold text-foreground sm:text-[16px]">
                  {productB.companyName}
                </p>
                <p className="mt-0.5 line-clamp-2 px-2 text-[13px] leading-snug text-sub-text">
                  {productB.productName}
                </p>
              </div>
            </div>

            {/* 비교 행 */}
            <div className="px-4 sm:px-6">
              {rows.map((row) => (
                <CompareRowItem key={row.label} row={row} />
              ))}
            </div>

            {/* 조건 태그 */}
            <div className="flex items-center border-t border-border px-6 py-5">
              <div className="flex min-w-0 flex-1 justify-center gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-[12px] text-sub-text">
                  {productA.category}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-[12px] text-sub-text">
                  {typeA}
                </span>
              </div>
              <span className="shrink-0 px-3 text-[13px] font-medium text-sub-text">
                조건
              </span>
              <div className="flex min-w-0 flex-1 justify-center gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-[12px] text-sub-text">
                  {productB.category}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-[12px] text-sub-text">
                  {typeB}
                </span>
              </div>
            </div>

            {/* 면책 */}
            <div className="px-6 pb-6">
              <p className="text-center text-[11px] text-sub-text">
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
    <div className="flex items-center gap-2 py-2.5 sm:gap-3">
      {/* A: 바 + 값 (우→좌) */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <div className="h-[30px] flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`ml-auto flex h-full items-center justify-start rounded-full pl-3 ${
              winnerSide === "a" ? "bg-blue-400" : "bg-red-300"
            }`}
            style={{ width: `${Math.max(barA, 18)}%` }}
          >
            <span className="whitespace-nowrap text-[12px] font-bold text-white sm:text-[13px]">
              {fmt(valueA, unit)}
            </span>
          </div>
        </div>
      </div>

      {/* 라벨 (중앙) */}
      <span className="w-[80px] shrink-0 text-center text-[12px] font-medium leading-tight text-sub-text sm:w-[100px] sm:text-[13px]">
        {label}
      </span>

      {/* B: 값 + 바 (좌→우) */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="h-[30px] flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`flex h-full items-center justify-start rounded-full pl-3 ${
              winnerSide === "b" ? "bg-blue-400" : "bg-red-300"
            }`}
            style={{ width: `${Math.max(barB, 18)}%` }}
          >
            <span className="whitespace-nowrap text-[12px] font-bold text-white sm:text-[13px]">
              {fmt(valueB, unit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
