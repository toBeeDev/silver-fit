import type { Metadata } from "next";
import { getBenefits } from "@/lib/welfare-api";
import BenefitListClient from "./BenefitListClient";

export const metadata: Metadata = {
  title: "노인 복지혜택 전체 목록",
  description:
    "기초연금, 노인일자리, 장기요양, 건강검진 등 어르신이 받을 수 있는 모든 복지혜택을 한눈에 확인하세요.",
};

export default function BenefitsPage() {
  const { benefits } = getBenefits(1, 100);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <div className="mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
          All Benefits
        </span>
        <h1 className="mt-6 text-4xl font-normal tracking-tight text-foreground md:text-5xl">
          복지혜택 전체 목록
        </h1>
        <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-sub-text">
          어르신이 받을 수 있는 복지혜택을 카테고리별로 확인하세요
        </p>
      </div>

      <BenefitListClient benefits={benefits} />
    </div>
  );
}
