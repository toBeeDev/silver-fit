"use client";

import CategoryFilter from "@/components/ui/CategoryFilter";
import type { BenefitCategory } from "@/types/benefit";

const CATEGORIES = [
  "전체",
  "생활지원",
  "의료건강",
  "주거지원",
  "일자리",
  "문화여가",
  "돌봄서비스",
  "교통",
] as const;

export interface BenefitFilterProps {
  selected: BenefitCategory | "전체";
  onSelect: (category: BenefitCategory | "전체") => void;
}

export default function BenefitFilter({
  selected,
  onSelect,
}: BenefitFilterProps) {
  return (
    <CategoryFilter
      categories={CATEGORIES}
      selected={selected}
      onSelect={onSelect}
      ariaLabel="혜택 카테고리 필터"
    />
  );
}
