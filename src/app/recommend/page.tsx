import type { Metadata } from "next";
import BenefitRecommender from "@/components/benefits/BenefitRecommender";
import { getBenefits } from "@/lib/welfare-api";

export const metadata: Metadata = {
  title: "맞춤 복지혜택 추천",
  description:
    "나이, 지역, 소득 수준을 입력하면 받을 수 있는 복지혜택을 자동으로 추천해드립니다.",
};

export default function RecommendPage() {
  const { benefits } = getBenefits(1, 1000);

  return (
    <BenefitRecommender benefits={benefits} />
  );
}
