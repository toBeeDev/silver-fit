"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Trophy, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { InsuranceProduct } from "@/types/insurance";
import { cn } from "@/lib/utils";
import { getCompanyUrl } from "@/lib/company-urls";

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  products: InsuranceProduct[];
}

interface CompareRow {
  label: string;
  format: (p: InsuranceProduct) => string;
  rawValue?: (p: InsuranceProduct) => number | null;
  higherIsBetter?: boolean;
}

const PENSION_ROWS: CompareRow[] = [
  {
    label: "평균수익률",
    format: (p) => (p.avgPrftRate != null ? `${p.avgPrftRate}%` : "-"),
    rawValue: (p) => p.avgPrftRate,
    higherIsBetter: true,
  },
  {
    label: "공시이율",
    format: (p) => (p.dclsRate != null ? `${p.dclsRate}%` : "-"),
    rawValue: (p) => p.dclsRate,
    higherIsBetter: true,
  },
  {
    label: "최근 1년",
    format: (p) => (p.btrmPrftRate1 != null ? `${p.btrmPrftRate1}%` : "-"),
    rawValue: (p) => p.btrmPrftRate1,
    higherIsBetter: true,
  },
  {
    label: "최근 2년",
    format: (p) => (p.btrmPrftRate2 != null ? `${p.btrmPrftRate2}%` : "-"),
    rawValue: (p) => p.btrmPrftRate2,
    higherIsBetter: true,
  },
  {
    label: "최근 3년",
    format: (p) => (p.btrmPrftRate3 != null ? `${p.btrmPrftRate3}%` : "-"),
    rawValue: (p) => p.btrmPrftRate3,
    higherIsBetter: true,
  },
  {
    label: "최저보증이율",
    format: (p) => p.guarRate || "-",
  },
];

const GENERAL_ROWS: CompareRow[] = [
  {
    label: "65세 남성",
    format: (p) =>
      p.premium65m != null ? `${p.premium65m.toLocaleString()}원` : "-",
    rawValue: (p) => p.premium65m,
    higherIsBetter: false,
  },
  {
    label: "65세 여성",
    format: (p) =>
      p.premium65f != null ? `${p.premium65f.toLocaleString()}원` : "-",
    rawValue: (p) => p.premium65f,
    higherIsBetter: false,
  },
  {
    label: "갱신 유형",
    format: (p) =>
      p.contractType === "renewal"
        ? "갱신형"
        : p.contractType === "non_renewal"
          ? "비갱신형"
          : "-",
  },
  {
    label: "가입연령",
    format: (p) => `만 ${p.minAge}~${p.maxAge}세`,
  },
  {
    label: "가입 조건",
    format: (p) => p.conditions || "-",
  },
];

function getBestIndex(
  products: InsuranceProduct[],
  rawValue: (p: InsuranceProduct) => number | null,
  higherIsBetter: boolean,
): number | null {
  let bestIdx: number | null = null;
  let bestVal: number | null = null;

  products.forEach((p, i) => {
    const v = rawValue(p);
    if (v == null) return;
    if (bestVal == null || (higherIsBetter ? v > bestVal : v < bestVal)) {
      bestVal = v;
      bestIdx = i;
    }
  });

  const allSame = products.every((p) => {
    const v = rawValue(p);
    return v == null || v === bestVal;
  });
  return allSame ? null : bestIdx;
}

export default function CompareModal({
  open,
  onClose,
  products,
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

  if (products.length < 2) return null;

  const isPension = products[0].category === "연금저축보험";
  const rows = isPension ? PENSION_ROWS : GENERAL_ROWS;
  const colCount = products.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-h-[90dvh] w-full max-w-[720px] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            {/* 헤더 */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
              <h2 className="text-section-title font-bold text-foreground">
                상품 비교
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-sub-text transition-colors hover:bg-gray-100"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 상품 카드 헤더 */}
            <div
              className={cn(
                "grid gap-2 px-4 pt-4 sm:gap-3 sm:px-6 sm:pt-5",
                colCount === 2 ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center rounded-xl border border-border bg-gray-50/80 px-2 py-3 text-center sm:px-3 sm:py-4"
                >
                  {p.finCoNo ? (
                    <Image
                      src={`/images/company/${p.finCoNo}.png`}
                      alt={p.companyName}
                      width={48}
                      height={48}
                      className="h-10 w-10 rounded-full sm:h-12 sm:w-12"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-label font-bold text-primary-700 sm:h-12 sm:w-12">
                      {p.companyName.slice(0, 2)}
                    </div>
                  )}
                  <p className="mt-1.5 text-caption font-medium text-primary-700 sm:mt-2 sm:text-body-sm">
                    {p.companyName}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-caption font-semibold leading-snug text-foreground sm:text-label">
                    {p.productName}
                  </p>
                </div>
              ))}
            </div>

            {/* 비교 테이블 */}
            <div className="mt-3 px-4 sm:mt-4 sm:px-6">
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full">
                  <tbody>
                    {rows.map((row, ri) => {
                      const bestIdx =
                        row.rawValue && row.higherIsBetter !== undefined
                          ? getBestIndex(
                              products,
                              row.rawValue,
                              row.higherIsBetter,
                            )
                          : null;

                      return (
                        <tr
                          key={row.label}
                          className={cn(
                            "border-b border-border/60 last:border-0",
                            ri % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                          )}
                        >
                          <td className="w-[72px] px-3 py-2.5 text-caption font-medium text-sub-text sm:w-[100px] sm:px-4 sm:py-3 sm:text-body-sm">
                            {row.label}
                          </td>
                          {products.map((p, i) => (
                            <td
                              key={p.id}
                              className={cn(
                                "px-2 py-2.5 text-center text-label tabular-nums sm:px-3 sm:py-3 sm:text-body",
                                bestIdx === i
                                  ? "font-bold text-primary-700"
                                  : "text-foreground",
                              )}
                            >
                              <span className="inline-flex items-center gap-1">
                                {bestIdx === i && (
                                  <Trophy className="h-3 w-3 text-amber-500 sm:h-3.5 sm:w-3.5" />
                                )}
                                {row.format(p)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA 버튼 */}
            <div
              className={cn(
                "grid gap-2 px-4 pt-4 pb-2 sm:gap-3 sm:px-6 sm:pt-5",
                colCount === 2 ? "grid-cols-2" : "grid-cols-3",
              )}
            >
              {products.map((p) => (
                <a
                  key={p.id}
                  href={p.finCoNo ? getCompanyUrl(p.finCoNo) : p.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] items-center justify-center gap-1 rounded-lg bg-primary-700 px-2 text-caption font-medium text-white transition-colors hover:bg-primary-800 sm:min-h-(--min-tap) sm:rounded-xl sm:px-4 sm:text-btn"
                >
                  <span className="truncate">{p.companyName}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                </a>
              ))}
            </div>

            {/* 면책 */}
            <p className="px-4 pb-5 pt-2 text-center text-caption text-sub-text sm:px-6 sm:pb-6">
              * 금감원 공시 데이터 기준. 실제 수치와 다를 수 있습니다.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
