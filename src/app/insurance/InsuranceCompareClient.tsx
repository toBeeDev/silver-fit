"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { Search, Users, ArrowUpDown } from "lucide-react";
import InsuranceFilter from "@/components/insurance/InsuranceFilter";
import InsuranceProductCard from "@/components/insurance/InsuranceProductCard";
import CompareBar from "@/components/common/CompareBar";
import type { CompareItem } from "@/components/common/CompareBar";
import CompareModal from "@/components/insurance/CompareModal";
import Pagination from "@/components/ui/Pagination";
import { filterInsuranceProducts } from "@/lib/insurance-filter";
import { useQueryStates } from "@/lib/use-query-state";
import type { InsuranceProduct, InsuranceCategory } from "@/types/insurance";

import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const MAX_COMPARE = 3;

type SortOrder =
  | "rate-desc"
  | "rate-asc"
  | "premium-asc"
  | "premium-desc";

type SortOption = { value: SortOrder; label: string };

const RATE_SORT_OPTIONS: SortOption[] = [
  { value: "rate-desc", label: "수익률 높은순" },
  { value: "rate-asc", label: "수익률 낮은순" },
];

const PREMIUM_SORT_OPTIONS: SortOption[] = [
  { value: "premium-asc", label: "보험료 낮은순" },
  { value: "premium-desc", label: "보험료 높은순" },
];

const ALL_SORT_OPTIONS: SortOption[] = [
  ...RATE_SORT_OPTIONS,
  ...PREMIUM_SORT_OPTIONS,
];

function getDefaultSort(category: InsuranceCategory | "전체"): SortOrder {
  if (category === "연금저축보험") return "rate-desc";
  if (category === "전체") return "rate-desc";
  return "premium-asc";
}

function getSortOptions(category: InsuranceCategory | "전체"): SortOption[] {
  if (category === "연금저축보험") return RATE_SORT_OPTIONS;
  if (category === "전체") return ALL_SORT_OPTIONS;
  return PREMIUM_SORT_OPTIONS;
}

interface InsuranceCompareClientProps {
  products: InsuranceProduct[];
}

const GENDER_OPTIONS = [
  { value: "", label: "전체" },
  { value: "m", label: "남성" },
  { value: "f", label: "여성" },
] as const;

const QS_DEFAULTS = {
  cat: "전체",
  gender: "",
  q: "",
  sort: "rate-desc",
  page: "1",
};

export default function InsuranceCompareClient({
  products,
}: InsuranceCompareClientProps) {
  const [qs, setQs] = useQueryStates(QS_DEFAULTS);

  const selectedCategory = qs.cat as InsuranceCategory | "전체";
  const selectedGender = qs.gender as "" | "m" | "f";
  const searchQuery = qs.q;
  const sortOrder = qs.sort as SortOrder;
  const currentPage = Math.max(1, Number(qs.page) || 1);

  const resultsRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = 64;

  // 비교 상태
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const removeCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const openCompare = useCallback(() => {
    if (compareIds.length >= 2) setShowCompare(true);
  }, [compareIds]);

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
      const top =
        el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }, 100);
  }

  function handleCategoryChange(category: InsuranceCategory | "전체") {
    setQs({ cat: category, sort: getDefaultSort(category), page: "1" });
    scrollToResults();
  }

  function handlePageChange(page: number) {
    setQs({ page: String(page) });
    scrollToResults();
  }

  const filtered = useMemo(() => {
    const base = filterInsuranceProducts(products, {
      category: selectedCategory,
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
    const getPremium = (p: InsuranceProduct) =>
      selectedGender === "f" ? p.premium65f : p.premium65m;

    if (sortOrder === "rate-desc") {
      result = [...result].sort(
        (a, b) => (b.avgPrftRate ?? 0) - (a.avgPrftRate ?? 0),
      );
    } else if (sortOrder === "rate-asc") {
      result = [...result].sort(
        (a, b) => (a.avgPrftRate ?? 0) - (b.avgPrftRate ?? 0),
      );
    } else if (sortOrder === "premium-asc") {
      result = [...result].sort(
        (a, b) => (getPremium(a) ?? Infinity) - (getPremium(b) ?? Infinity),
      );
    } else if (sortOrder === "premium-desc") {
      result = [...result].sort(
        (a, b) => (getPremium(b) ?? 0) - (getPremium(a) ?? 0),
      );
    }
    return result;
  }, [
    products,
    selectedCategory,
    selectedGender,
    searchQuery,
    sortOrder,
  ]);

  const visibleSortOptions = useMemo(
    () => getSortOptions(selectedCategory),
    [selectedCategory],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  return (
    <div className="mx-auto max-w-4xl px-(--space-page-x) pb-10 pt-6 sm:pt-10">
      {/* 헤더: 타이틀 + 검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-section-title font-bold text-foreground sm:text-page-title">
            보험상품 비교
          </h1>
          <p className="mt-1 text-body-sm text-sub-text">
            금감원 공시 데이터 기반 · {products.length}개 상품
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQs({ page: "1" });
            scrollToResults();
          }}
          className="relative w-full sm:w-[280px]"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setQs({ q: e.target.value, page: "1" })}
            placeholder="상품명·회사명 검색"
            className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-body-sm text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none sm:h-10"
          />
        </form>
      </div>

      {/* 필터 */}
      <div className="mt-5 flex flex-col gap-3 sm:mt-6">
        {/* 보험 유형 */}
        <InsuranceFilter
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />

        {/* 성별 */}
        <div className="rounded-xl border border-border bg-white">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              <Users className="h-3.5 w-3.5 text-primary-600" />
            </div>
            <span className="shrink-0 text-body-sm font-medium text-sub-text">
              성별
            </span>
            <div className="flex gap-1">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setQs({ gender: opt.value, page: "1" });
                    scrollToResults();
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-caption font-medium transition-all sm:px-3 sm:py-1 sm:text-label",
                    selectedGender === opt.value
                      ? "bg-primary-700 text-white"
                      : "bg-gray-100 text-sub-text hover:bg-gray-200",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 툴바: 건수 + 정렬 + VS 안내 */}
      <div ref={resultsRef} className="mt-5 flex flex-wrap items-center justify-between gap-2 sm:mt-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-body font-semibold text-foreground">
            {filtered.length}건
          </span>
          {totalPages > 1 && (
            <span className="text-caption text-sub-text sm:text-body-sm">
              {currentPage}/{totalPages}
            </span>
          )}
          <span className="hidden items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-caption font-medium text-primary-700 sm:inline-flex">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-100 text-[8px]">VS</span>
            2~3개 선택 후 비교
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <ArrowUpDown className="h-3.5 w-3.5 text-sub-text" />
          {visibleSortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQs({ sort: opt.value, page: "1" })}
              className={cn(
                "rounded-full px-2 py-0.5 text-caption font-medium transition-all sm:px-2.5 sm:py-1 sm:text-label",
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

      {/* 리스트 */}
      <div className="mt-2 sm:mt-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
            <p className="text-section-title font-medium text-foreground">
              조건에 맞는 상품이 없습니다
            </p>
            <p className="mt-2 text-body text-sub-text">
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
                  gender={selectedGender || undefined}
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

      {/* 면책 */}
      <p className="mt-4 text-center text-caption text-sub-text">
        금감원 금융상품한눈에 공시 데이터 기준. 보험료는 가입 조건에 따라
        달라질 수 있습니다.
      </p>

      {/* 비교 바 */}
      <CompareBar
        items={compareItems}
        maxItems={MAX_COMPARE}
        minItems={2}
        onRemove={removeCompare}
        onCompare={openCompare}
        onClear={clearCompare}
      />

      {/* 비교 모달 */}
      <CompareModal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        products={compareProducts}
      />
    </div>
  );
}
