"use client";

import { useState, useRef } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import BenefitList from "@/components/benefits/BenefitList";
import { filterBenefits } from "@/lib/benefits";
import type { Benefit, IncomeLevel } from "@/types/benefit";
import { MoveRight } from "lucide-react";

const REGION_OPTIONS = [
  "전국", "서울", "부산", "대구", "인천", "광주", "대전", "울산",
  "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
].map((r) => ({ value: r, label: r }));

const INCOME_OPTIONS = [
  { value: "기초생활", label: "기초생활수급자" },
  { value: "차상위", label: "차상위계층" },
  { value: "중위50", label: "중위소득 50% 이하" },
  { value: "중위100", label: "중위소득 100% 이하" },
  { value: "중위150", label: "중위소득 150% 이하" },
  { value: "무관", label: "해당 없음 / 모르겠음" },
];

export interface BenefitRecommenderProps {
  benefits: Benefit[];
}

export default function BenefitRecommender({
  benefits,
}: BenefitRecommenderProps) {
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("전국");
  const [income, setIncome] = useState<IncomeLevel>("무관");
  const [results, setResults] = useState<Benefit[] | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0) return;

    const filtered = filterBenefits(benefits, {
      age: ageNum,
      region,
      incomeLevel: income,
    });
    setResults(filtered);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <div className="-mt-16">
      {/* Section 1: 검색 폼 */}
      <section className="full-section relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/benefits-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/97" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:gap-16 sm:py-0">
          {/* Left — 헤딩 */}
          <div className="shrink-0 sm:w-[280px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              Personalized
            </span>
            <h1 className="mt-4 text-3xl font-normal tracking-tight text-foreground sm:mt-6 sm:text-4xl md:text-5xl">
              맞춤 혜택
              <br />
              추천
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
              간단한 정보를 입력하시면,
              <br className="hidden sm:block" />
              받을 수 있는 혜택을 찾아드립니다
            </p>

            {/* Trust indicators */}
            <div className="mt-8 hidden flex-col gap-3 sm:flex">
              {[
                "나이·지역·소득 3가지만 입력",
                "실시간 맞춤 필터링",
                "14종+ 혜택 데이터베이스",
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

          {/* Right — 폼 */}
          <div className="w-full flex-1">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <Input
                  id="age"
                  label="나이 (만)"
                  type="number"
                  min={0}
                  max={120}
                  placeholder="예: 68"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
                <Select
                  id="region"
                  label="거주 지역"
                  options={REGION_OPTIONS}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
                <Select
                  id="income"
                  label="소득 수준"
                  options={INCOME_OPTIONS}
                  value={income}
                  onChange={(e) => setIncome(e.target.value as IncomeLevel)}
                />
              </div>

              <div className="mt-8">
                <Button type="submit" size="lg" className="w-full gap-4">
                  혜택 찾기 <MoveRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Section 2: 결과 */}
      {results !== null && (
        <section ref={resultsRef} className="relative min-h-[100dvh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/testimonial-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-background/95" />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-start sm:gap-16 sm:py-20">
            {/* Left — 헤딩 */}
            <div className="shrink-0 sm:w-[260px]">
              <span className="text-xs font-medium uppercase tracking-widest text-sub-text">
                Results
              </span>
              <h2 className="mt-4 text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-5xl">
                추천
                <br />
                혜택
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
                입력하신 조건에 맞는
                <br className="hidden sm:block" />
                혜택을 찾았습니다
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                  {results.length}건
                </span>
              </div>
            </div>

            {/* Right — 결과 리스트 */}
            <div className="w-full flex-1">
              <BenefitList benefits={results} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
