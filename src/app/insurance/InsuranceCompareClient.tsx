"use client";

import { useState, useEffect, useRef } from "react";
import InsuranceFilter from "@/components/insurance/InsuranceFilter";
import InsuranceProductCard from "@/components/insurance/InsuranceProductCard";
import {
  filterInsuranceProducts,
  transformFssProduct,
} from "@/lib/insurance";
import type {
  InsuranceProduct,
  InsuranceCategory,
  FssApiResponse,
} from "@/types/insurance";
import { cn } from "@/lib/utils";

const AGE_PRESETS = [60, 65, 70, 75] as const;

interface InsuranceCompareClientProps {
  staticProducts: InsuranceProduct[];
}

export default function InsuranceCompareClient({
  staticProducts,
}: InsuranceCompareClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    InsuranceCategory | "전체"
  >("전체");
  const [selectedAge, setSelectedAge] = useState<number | undefined>(undefined);
  const [fssProducts, setFssProducts] = useState<InsuranceProduct[]>([]);
  const [fssLoading, setFssLoading] = useState(false);
  const [fssError, setFssError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  // FSS 데이터 로드 (연금저축보험)
  useEffect(() => {
    if (fssProducts.length > 0) return;
    if (
      selectedCategory !== "전체" &&
      selectedCategory !== "연금저축보험"
    )
      return;

    async function fetchFss() {
      setFssLoading(true);
      setFssError("");
      try {
        const res = await fetch("/api/fss?topFinGrpNo=050000&pageNo=1");
        if (!res.ok) throw new Error("금감원 데이터를 불러오지 못했습니다.");
        const data: FssApiResponse = await res.json();
        if (data.result?.err_cd && data.result.err_cd !== "000") {
          throw new Error(
            data.result.err_msg || "금감원 API 오류가 발생했습니다.",
          );
        }
        const products = (data.result?.baseList ?? []).map((base) => {
          const option = data.result?.optionList?.find(
            (o) => o.fin_prdt_cd === base.fin_prdt_cd,
          );
          return transformFssProduct(base, option);
        });
        setFssProducts(products);
      } catch (e) {
        setFssError(
          e instanceof Error ? e.message : "데이터 로딩 오류",
        );
      }
      setFssLoading(false);
    }

    fetchFss();
  }, [selectedCategory, fssProducts.length]);

  const allProducts = [...staticProducts, ...fssProducts];
  const filtered = filterInsuranceProducts(allProducts, {
    category: selectedCategory,
    age: selectedAge,
  });

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
              비교
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
                onSelect={setSelectedCategory}
              />
            </div>

            <div>
              <p className="mb-3 text-[14px] font-medium text-foreground">
                나이 (만)
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAge(undefined)}
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
                    onClick={() => setSelectedAge(age)}
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
              비교
              <br />
              결과
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
              조건에 맞는 보험상품을
              <br className="hidden sm:block" />
              찾았습니다
            </p>

            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                {filtered.length}건
              </span>
            </div>

            {/* 데이터 출처 */}
            <div className="mt-6 flex flex-col gap-1 text-[13px] leading-relaxed text-sub-text">
              <p>* 연금저축: 금감원 금융상품한눈에</p>
              <p>* 기타: 각 보험사 공시 (2026.02)</p>
            </div>
          </div>

          {/* Right — 카드 그리드 */}
          <div className="w-full flex-1">
            {fssLoading && (
              <div className="mb-4 rounded-xl border border-border bg-white px-4 py-3 text-center text-[14px] text-sub-text">
                금감원 데이터를 불러오는 중...
              </div>
            )}
            {fssError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                {fssError}
              </div>
            )}

            {filtered.length === 0 && !fssLoading ? (
              <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
                <p className="text-[17px] font-medium text-foreground">
                  조건에 맞는 상품이 없습니다
                </p>
                <p className="mt-2 text-[15px] text-sub-text">
                  필터 조건을 변경해보세요
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((product) => (
                  <InsuranceProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
