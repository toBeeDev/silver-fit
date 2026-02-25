"use client";

import { useState, useMemo } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsuranceOption } from "@/types/insurance";

interface PensionSimulatorProps {
  options: InsuranceOption[];
}

type FilterKey =
  | "receiptTerm"
  | "entryAge"
  | "monthlyPayment"
  | "paymentPeriod"
  | "startAge";

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "receiptTerm", label: "연금수령기간" },
  { key: "entryAge", label: "가입연령" },
  { key: "monthlyPayment", label: "월납입금액" },
  { key: "paymentPeriod", label: "납입기간" },
  { key: "startAge", label: "개시연령" },
];

function getDisplayValue(key: FilterKey, option: InsuranceOption): string {
  switch (key) {
    case "receiptTerm":
      return option.receiptTermNm;
    case "entryAge":
      return `${option.entryAge}세`;
    case "monthlyPayment":
      return `${option.monthlyPayment}만원`;
    case "paymentPeriod":
      return `${option.paymentPeriod}년`;
    case "startAge":
      return `${option.startAge}세`;
  }
}

function getRawValue(key: FilterKey, option: InsuranceOption): string {
  switch (key) {
    case "receiptTerm":
      return option.receiptTerm;
    case "entryAge":
      return option.entryAge;
    case "monthlyPayment":
      return option.monthlyPayment;
    case "paymentPeriod":
      return option.paymentPeriod;
    case "startAge":
      return option.startAge;
  }
}

export default function PensionSimulator({ options }: PensionSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>(
    {},
  );

  const activeCount = Object.keys(filters).length;

  // 현재 필터로 걸러진 옵션
  const filtered = useMemo(() => {
    return options.filter((o) => {
      for (const [key, val] of Object.entries(filters)) {
        if (getRawValue(key as FilterKey, o) !== val) return false;
      }
      return true;
    });
  }, [options, filters]);

  // 활성 필터의 선택 가능 값 목록
  const activeOptions = useMemo(() => {
    if (!activeFilter) return [];
    // 현재 활성 필터를 제외한 나머지 필터만 적용
    const baseFiltered = options.filter((o) => {
      for (const [key, val] of Object.entries(filters)) {
        if (key === activeFilter) continue;
        if (getRawValue(key as FilterKey, o) !== val) return false;
      }
      return true;
    });
    const map = new Map<string, string>();
    for (const o of baseFiltered) {
      const raw = getRawValue(activeFilter, o);
      if (!map.has(raw)) map.set(raw, getDisplayValue(activeFilter, o));
    }
    return [...map.entries()].sort((a, b) => {
      const na = parseFloat(a[0]);
      const nb = parseFloat(b[0]);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a[0].localeCompare(b[0]);
    });
  }, [options, filters, activeFilter]);

  function handleChipClick(key: FilterKey) {
    setActiveFilter(activeFilter === key ? null : key);
  }

  function handleValueSelect(val: string) {
    if (!activeFilter) return;
    setFilters((prev) => {
      if (prev[activeFilter] === val) {
        const next = { ...prev };
        delete next[activeFilter];
        return next;
      }
      return { ...prev, [activeFilter]: val };
    });
    // 값 선택 후 필터 닫기
    setActiveFilter(null);
  }

  function handleSelectAll() {
    if (!activeFilter) return;
    setFilters((prev) => {
      const next = { ...prev };
      delete next[activeFilter];
      return next;
    });
    // 전체 선택 후 필터 닫기
    setActiveFilter(null);
  }

  function handleReset() {
    setFilters({});
    setActiveFilter(null);
  }

  // 정렬
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.receiptTerm !== b.receiptTerm)
        return a.receiptTerm.localeCompare(b.receiptTerm);
      if (a.entryAge !== b.entryAge)
        return Number(a.entryAge) - Number(b.entryAge);
      if (a.monthlyPayment !== b.monthlyPayment)
        return Number(a.monthlyPayment) - Number(b.monthlyPayment);
      if (a.paymentPeriod !== b.paymentPeriod)
        return Number(a.paymentPeriod) - Number(b.paymentPeriod);
      return Number(a.startAge) - Number(b.startAge);
    });
  }, [filtered]);

  if (options.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center text-[15px] text-sub-text">
        이 상품의 연금 계산 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      {/* 아코디언 헤더 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-[19px] font-semibold text-foreground">
            연금 계산기
          </h2>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-sub-text transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* 아코디언 바디 */}
      {isOpen && (
        <div className="border-t border-border px-6 pb-6 pt-5">
          {/* 필터 칩 행 */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_LABELS.map(({ key, label }) => {
              const isActive = activeFilter === key;
              const hasValue = filters[key] != null;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChipClick(key)}
                  className={cn(
                    "inline-flex min-h-[36px] items-center gap-1 rounded-full px-4 text-[13px] font-medium transition-all sm:text-[14px]",
                    isActive
                      ? "bg-primary-700 text-white shadow-sm"
                      : hasValue
                        ? "border border-primary-200 bg-primary-50 text-primary-700"
                        : "border border-border bg-white text-foreground hover:border-foreground/30",
                  )}
                >
                  {label}
                  {hasValue && !isActive && (
                    <span className="text-[12px] font-semibold">
                      {(() => {
                        const o = options.find(
                          (opt) => getRawValue(key, opt) === filters[key],
                        );
                        return o ? getDisplayValue(key, o) : "";
                      })()}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isActive && "rotate-180",
                    )}
                  />
                </button>
              );
            })}

            {/* 리셋 */}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-foreground/80"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                초기화
              </button>
            )}
          </div>

          {/* 하위 옵션 칩 */}
          {activeFilter && activeOptions.length > 0 && (
            <div className="mt-3 rounded-xl border border-border/60 bg-gray-50/50 p-3">
              <p className="mb-2 text-[12px] font-medium text-sub-text">
                {FILTER_LABELS.find((f) => f.key === activeFilter)?.label} 선택
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={cn(
                    "inline-flex min-h-[32px] items-center rounded-full px-3.5 text-[13px] font-medium transition-all",
                    filters[activeFilter] == null
                      ? "bg-primary-700 text-white shadow-sm"
                      : "border border-border bg-white text-sub-text hover:border-foreground/30",
                  )}
                >
                  전체
                </button>
                {activeOptions.map(([raw, display]) => (
                  <button
                    key={raw}
                    type="button"
                    onClick={() => handleValueSelect(raw)}
                    className={cn(
                      "inline-flex min-h-[32px] items-center rounded-full px-3.5 text-[13px] font-medium transition-all",
                      filters[activeFilter] === raw
                        ? "bg-primary-700 text-white shadow-sm"
                        : "border border-border bg-white text-sub-text hover:border-foreground/30",
                    )}
                  >
                    {display}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 결과 카운트 */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[13px] text-sub-text">
              총 <span className="font-semibold text-foreground">{sorted.length}</span>건
            </p>
          </div>

          {/* 결과 테이블 */}
          <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-[13px] sm:text-[14px]">
              <thead>
                <tr className="bg-gradient-to-r from-primary-50 to-blue-50">
                  <th className="whitespace-nowrap px-3 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-primary-600 sm:px-4 sm:text-[13px]">
                    수령기간
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-primary-600 sm:px-4 sm:text-[13px]">
                    가입연령
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-primary-600 sm:px-4 sm:text-[13px]">
                    월납입
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-primary-600 sm:px-4 sm:text-[13px]">
                    납입기간
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-primary-600 sm:px-4 sm:text-[13px]">
                    개시연령
                  </th>
                  <th className="whitespace-nowrap px-3 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-primary-600 sm:px-4 sm:text-[13px]">
                    월 연금수령액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sub-text"
                    >
                      조건에 해당하는 데이터가 없습니다
                    </td>
                  </tr>
                ) : (
                  sorted.map((o, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-primary-50/40"
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-foreground">
                          {o.receiptTermNm}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                        <span className="font-medium text-foreground">
                          {o.entryAge}
                        </span>
                        <span className="text-sub-text">세</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                        <span className="font-medium text-foreground">
                          {o.monthlyPayment}
                        </span>
                        <span className="text-sub-text">만원</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                        <span className="font-medium text-foreground">
                          {o.paymentPeriod}
                        </span>
                        <span className="text-sub-text">년</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                        <span className="font-medium text-foreground">
                          {o.startAge}
                        </span>
                        <span className="text-sub-text">세</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4">
                        <span className="text-[15px] font-bold tabular-nums text-primary-700 sm:text-[16px]">
                          {o.receiptAmount.toLocaleString()}
                        </span>
                        <span className="ml-0.5 text-[12px] text-sub-text">원</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[12px] text-sub-text">
            * 예상 월연금액은 금감원 공시 데이터 기준이며, 실제 수령액과 다를 수
            있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
