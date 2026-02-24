"use client";

import { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import InsuranceFilter from "@/components/insurance/InsuranceFilter";
import InsuranceProductCard from "@/components/insurance/InsuranceProductCard";
import { filterInsuranceProducts } from "@/lib/insurance-filter";
import type { InsuranceProduct, InsuranceCategory } from "@/types/insurance";
import { cn } from "@/lib/utils";

const AGE_PRESETS = [60, 65, 70, 75] as const;
const PAGE_SIZE = 10;

interface InsuranceCompareClientProps {
  products: InsuranceProduct[];
}

export default function InsuranceCompareClient({
  products,
}: InsuranceCompareClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    InsuranceCategory | "전체"
  >("전체");
  const [selectedAge, setSelectedAge] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  function scrollToResults() {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function handleCategoryChange(category: InsuranceCategory | "전체") {
    setSelectedCategory(category);
    setCurrentPage(1);
    scrollToResults();
  }

  function handleAgeChange(age: number | undefined) {
    setSelectedAge(age);
    setCurrentPage(1);
    scrollToResults();
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    scrollToResults();
  }

  const filtered = filterInsuranceProducts(products, {
    category: selectedCategory,
    age: selectedAge,
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  return (
    <div className="-mt-16">
      {/* Section 1: 필터 */}
      <section className="full-section relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/benefits-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/97" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:gap-16 sm:py-0">
          {/* Left */}
          <div className="shrink-0 sm:w-[280px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              Insurance Compare
            </span>
            <h1 className="mt-4 text-3xl font-normal tracking-tight text-foreground sm:mt-6 sm:text-4xl md:text-5xl">
              보험상품
              <br />
              찾기
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
              어르신을 위한 보험상품을
              <br className="hidden sm:block" />
              한눈에 비교해보세요
            </p>

            {/* Trust indicators */}
            <div className="mt-8 hidden flex-col gap-3 sm:flex">
              {[
                "금감원 공시 데이터 기반",
                "4종 보험 유형 비교",
                "보험사 바로가기 제공",
              ].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 text-[14px] text-sub-text"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-600" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 필터 */}
          <div className="w-full flex-1">
            <div className="mb-6">
              <p className="mb-3 text-[14px] font-medium text-foreground">
                보험 유형
              </p>
              <InsuranceFilter
                selected={selectedCategory}
                onSelect={handleCategoryChange}
              />
            </div>

            <div>
              <p className="mb-3 text-[14px] font-medium text-foreground">
                나이 (만)
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAgeChange(undefined)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center rounded-full px-4 text-[14px] font-medium transition-all duration-200 sm:px-5 sm:text-[15px]",
                    selectedAge === undefined
                      ? "bg-primary-700 text-white"
                      : "border border-border text-sub-text hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  전체
                </button>
                {AGE_PRESETS.map((age) => (
                  <button
                    key={age}
                    onClick={() => handleAgeChange(age)}
                    className={cn(
                      "inline-flex min-h-[44px] items-center rounded-full px-4 text-[14px] font-medium transition-all duration-200 sm:px-5 sm:text-[15px]",
                      selectedAge === age
                        ? "bg-primary-700 text-white"
                        : "border border-border text-sub-text hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    {age}세
                  </button>
                ))}
              </div>
            </div>

            {/* 면책 안내 */}
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-800">
              ⚠️ 보험료는 가입 조건에 따라 달라질 수 있습니다. 정확한 보험료는
              각 보험사에 문의하세요.
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 결과 */}
      <section
        ref={resultsRef}
        className="relative min-h-[100dvh] overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/testimonial-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/95" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-start sm:gap-16 sm:py-20">
          {/* Left */}
          <div className="shrink-0 sm:w-[260px]">
            <span className="text-xs font-medium uppercase tracking-widest text-sub-text">
              Results
            </span>
            <h2 className="mt-4 text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-5xl">
              결과
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
              조건에 맞는 보험상품을
              <br className="hidden sm:block" />
              찾았습니다
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                총 {filtered.length}건
              </span>
              {totalPages > 1 && (
                <span className="text-xs text-sub-text">
                  {currentPage} / {totalPages} 페이지
                </span>
              )}
            </div>

            {/* 데이터 출처 */}
            <div className="mt-6 flex flex-col gap-1 text-[13px] leading-relaxed text-sub-text">
              <p>* 금감원 금융상품한눈에 기반</p>
              <p>* 공시기준: 2020.10</p>
            </div>
          </div>

          {/* Right — 리스트 */}
          <div className="w-full flex-1">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
                <p className="text-[17px] font-medium text-foreground">
                  조건에 맞는 상품이 없습니다
                </p>
                <p className="mt-2 text-[15px] text-sub-text">
                  필터 조건을 변경해보세요
                </p>
              </div>
            ) : (
              <>
                <div>
                  {paged.map((product, i) => (
                    <InsuranceProductCard
                      key={product.id}
                      product={product}
                      index={(currentPage - 1) * PAGE_SIZE + i}
                    />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <nav
                    aria-label="페이지 이동"
                    className="mt-8 flex items-center justify-center gap-1"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sub-text transition-colors hover:bg-white/60 disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="이전 페이지"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        return Math.abs(page - currentPage) <= 2;
                      })
                      .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                        if (idx > 0 && page - (arr[idx - 1] ?? 0) > 1) acc.push("...");
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span
                            key={`dot-${idx}`}
                            className="inline-flex h-10 w-6 items-center justify-center text-[14px] text-sub-text"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            className={cn(
                              "inline-flex h-10 min-w-10 items-center justify-center rounded-full text-[14px] font-medium transition-colors",
                              currentPage === item
                                ? "bg-primary-700 text-white"
                                : "text-sub-text hover:bg-white/60",
                            )}
                          >
                            {item}
                          </button>
                        ),
                      )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sub-text transition-colors hover:bg-white/60 disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="다음 페이지"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
