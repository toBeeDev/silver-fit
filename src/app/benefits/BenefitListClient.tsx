"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import BenefitFilter from "@/components/benefits/BenefitFilter";
import BenefitList from "@/components/benefits/BenefitList";
import { filterBenefits } from "@/lib/benefits";
import { useQueryStates } from "@/lib/use-query-state";
import type { Benefit, BenefitCategory, IncomeLevel } from "@/types/benefit";

const REGION_OPTIONS = [
  "전국",
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const INCOME_OPTIONS = [
  { value: "무관", label: "전체" },
  { value: "기초생활", label: "기초생활" },
  { value: "차상위", label: "차상위" },
  { value: "중위50", label: "중위50%" },
  { value: "중위100", label: "중위100%" },
  { value: "중위150", label: "중위150%" },
];

const QS_DEFAULTS = {
  cat: "전체",
  age: "",
  region: "전국",
  income: "무관",
  q: "",
};

interface BenefitListClientProps {
  benefits: Benefit[];
}

export default function BenefitListClient({
  benefits,
}: BenefitListClientProps) {
  const [qs, setQs] = useQueryStates(QS_DEFAULTS);

  const selectedCategory = qs.cat as BenefitCategory | "전체";
  const ageValue = qs.age ? parseInt(qs.age, 10) : undefined;
  const searchQuery = qs.q;

  const filtered = useMemo(() => {
    return filterBenefits(benefits, {
      category:
        selectedCategory !== "전체" ? selectedCategory : undefined,
      age: ageValue && !isNaN(ageValue) && ageValue >= 0 ? ageValue : undefined,
      region: qs.region !== "전국" ? qs.region : undefined,
      incomeLevel:
        (qs.income as IncomeLevel) !== "무관"
          ? (qs.income as IncomeLevel)
          : undefined,
      keyword: searchQuery.trim() || undefined,
    });
  }, [benefits, selectedCategory, ageValue, qs.region, qs.income, searchQuery]);

  const hasPersonalFilter =
    qs.age !== "" || qs.region !== "전국" || qs.income !== "무관";

  return (
    <div className="mx-auto max-w-4xl px-(--space-page-x) pb-10 pt-6 sm:pt-10">
      {/* 헤더: 타이틀 + 검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-section-title font-bold text-foreground sm:text-page-title">
            복지혜택
          </h1>
          <p className="mt-1 text-body-sm text-sub-text">
            어르신을 위한 맞춤 복지혜택 · {benefits.length}개
          </p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative w-full sm:w-[280px]"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setQs({ q: e.target.value })}
            placeholder="혜택명·키워드 검색"
            className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-body-sm text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none sm:h-10"
          />
        </form>
      </div>

      {/* 필터 */}
      <div className="mt-5 flex flex-col gap-3 sm:mt-6">
        {/* 카테고리 */}
        <BenefitFilter
          selected={selectedCategory}
          onSelect={(cat) => setQs({ cat })}
        />

        {/* 맞춤 필터: 나이, 지역, 소득 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-caption font-medium text-sub-text sm:text-body-sm">
              나이
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              placeholder="만 나이"
              value={qs.age}
              onChange={(e) => setQs({ age: e.target.value })}
              className="h-8 w-[72px] rounded-lg border border-border bg-white px-2.5 text-body-sm tabular-nums text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none sm:h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-caption font-medium text-sub-text sm:text-body-sm">
              지역
            </span>
            <select
              value={qs.region}
              onChange={(e) => setQs({ region: e.target.value })}
              className="h-8 rounded-lg border border-border bg-white px-2 pr-7 text-body-sm text-foreground focus:border-primary-400 focus:outline-none sm:h-9"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-caption font-medium text-sub-text sm:text-body-sm">
              소득
            </span>
            <select
              value={qs.income}
              onChange={(e) => setQs({ income: e.target.value })}
              className="h-8 rounded-lg border border-border bg-white px-2 pr-7 text-body-sm text-foreground focus:border-primary-400 focus:outline-none sm:h-9"
            >
              {INCOME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 건수 */}
      <div className="mt-5 flex items-center gap-2 sm:mt-6">
        <span className="text-body font-semibold text-foreground">
          {filtered.length}건
        </span>
        {hasPersonalFilter && (
          <button
            onClick={() => setQs({ age: "", region: "전국", income: "무관" })}
            className="rounded-full px-2 py-0.5 text-caption font-medium text-sub-text transition-colors hover:bg-gray-100"
          >
            맞춤 필터 초기화
          </button>
        )}
      </div>

      {/* 결과 리스트 */}
      <div className="mt-2 sm:mt-3">
        <BenefitList benefits={filtered} />
      </div>
    </div>
  );
}
