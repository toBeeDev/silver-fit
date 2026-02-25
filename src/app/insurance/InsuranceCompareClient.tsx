"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { ArrowUpDown, Search } from "lucide-react";
import InsuranceFilter from "@/components/insurance/InsuranceFilter";
import InsuranceProductCard from "@/components/insurance/InsuranceProductCard";
import CompareBar from "@/components/common/CompareBar";
import type { CompareItem } from "@/components/common/CompareBar";
import Pagination from "@/components/ui/Pagination";
import { filterInsuranceProducts } from "@/lib/insurance-filter";
import type { InsuranceProduct, InsuranceCategory } from "@/types/insurance";

const CompareModal = dynamic(
  () => import("@/components/insurance/CompareModal"),
  { ssr: false },
);
import { cn } from "@/lib/utils";

const AGE_PRESETS = [60, 65, 70, 75] as const;
const PAGE_SIZE = 10;
const MAX_COMPARE = 2;

type SortOrder = "default" | "rate-desc" | "rate-asc";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "기본순" },
  { value: "rate-desc", label: "수익률 높은순" },
  { value: "rate-asc", label: "수익률 낮은순" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = 64; // h-16

  // 비교 상태
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= MAX_COMPARE) return prev;
        return [...prev, id];
      });
    },
    [],
  );

  const removeCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    setShowModal(false);
  }, []);

  const compareProducts = useMemo(
    () =>
      compareIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is InsuranceProduct => p != null),
    [compareIds, products],
  );

  const compareItems: CompareItem[] = useMemo(
    () =>
      compareProducts.map((p) => ({
        id: p.id,
        title: p.productName,
        subtitle: p.companyName,
      })),
    [compareProducts],
  );

  function scrollToResults() {
    setTimeout(() => {
      const el = resultsRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
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

  const filtered = useMemo(() => {
    const base = filterInsuranceProducts(products, {
      category: selectedCategory,
      age: selectedAge,
    });
    let result = base;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q),
      );
    }
    if (sortOrder === "rate-desc") {
      result = [...result].sort((a, b) => (b.avgPrftRate ?? 0) - (a.avgPrftRate ?? 0));
    } else if (sortOrder === "rate-asc") {
      result = [...result].sort((a, b) => (a.avgPrftRate ?? 0) - (b.avgPrftRate ?? 0));
    }
    return result;
  }, [products, selectedCategory, selectedAge, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  return (
    <div className="-mt-16">
      {/* Hero: 필터 */}
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

            {/* 검색바 */}
            <div className="mt-6">
              <p className="mb-3 text-[14px] font-medium text-foreground">
                상품 검색
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentPage(1);
                  scrollToResults();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sub-text" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="상품명 또는 회사명 검색"
                    className="h-[44px] w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[15px] text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-[44px] shrink-0 items-center rounded-xl bg-primary-700 px-5 text-[15px] font-medium text-white transition-colors hover:bg-primary-800"
                >
                  검색
                </button>
              </form>
            </div>

            {/* 면책 안내 */}
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-800">
              ⚠️ 보험료는 가입 조건에 따라 달라질 수 있습니다. 정확한 보험료는
              각 보험사에 문의하세요.
            </div>
          </div>
        </div>
      </section>

      {/* 결과 리스트 */}
      <div ref={resultsRef} className="mx-auto max-w-3xl px-5 py-10">
        {/* 툴바: 건수 + 정렬 + 비교 안내 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-foreground">
              총 {filtered.length}건
            </span>
            {totalPages > 1 && (
              <span className="text-[13px] text-sub-text">
                {currentPage} / {totalPages} 페이지
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-sub-text" />
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSortOrder(opt.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition-all",
                  sortOrder === opt.value
                    ? "bg-primary-700 text-white"
                    : "text-sub-text hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-3 flex flex-col gap-1.5 text-[12px] text-sub-text">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px]">VS</span>
            체크 버튼으로 2개 상품을 선택하면 비교가 가능합니다
          </p>
          <p>금감원 금융상품한눈에 공시 데이터 기준 (2020.10)</p>
        </div>

        {/* 리스트 */}
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
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
                    selected={compareIds.includes(product.id)}
                    onToggle={toggleCompare}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

      </div>

      {/* 비교 바 */}
      <CompareBar
        items={compareItems}
        onRemove={removeCompare}
        onCompare={() => setShowModal(true)}
        onClear={clearCompare}
      />

      {/* 비교 모달 */}
      {compareProducts.length === 2 && (
        <CompareModal
          open={showModal}
          onClose={() => setShowModal(false)}
          productA={compareProducts[0]}
          productB={compareProducts[1]}
        />
      )}
    </div>
  );
}
