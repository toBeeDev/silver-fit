"use client";

import CategoryFilter from "@/components/ui/CategoryFilter";
import type { InsuranceCategory } from "@/types/insurance";

const CATEGORIES = ["전체", "연금저축보험"] as const;

export interface InsuranceFilterProps {
  selected: InsuranceCategory | "전체";
  onSelect: (category: InsuranceCategory | "전체") => void;
}

export default function InsuranceFilter({
  selected,
  onSelect,
}: InsuranceFilterProps) {
  return (
    <CategoryFilter
      categories={CATEGORIES}
      selected={selected}
      onSelect={onSelect}
      ariaLabel="보험 유형 필터"
    />
  );
}
