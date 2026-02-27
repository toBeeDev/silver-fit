import type { Metadata } from "next";
import { Suspense } from "react";
import { getBenefits } from "@/lib/welfare-api";
import BenefitListClient from "./BenefitListClient";

export const metadata: Metadata = {
  title: "복지혜택 - 맞춤 검색",
  description:
    "기초연금, 노인일자리, 장기요양, 건강검진 등 부모님이 받을 수 있는 모든 복지혜택을 나이·지역·소득 조건에 맞게 검색하세요.",
};

export default function BenefitsPage() {
  const { benefits } = getBenefits(1, 1000);

  return (
    <Suspense>
      <BenefitListClient benefits={benefits} />
    </Suspense>
  );
}
