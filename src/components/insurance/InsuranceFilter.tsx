"use client";

import { cn } from "@/lib/utils";
import type { InsuranceCategory } from "@/types/insurance";

const CATEGORIES: (InsuranceCategory | "전체")[] = [
  "전체",
  "간병보험",
  "실손보험",
  "치매보험",
  "연금저축보험",
];

export interface InsuranceFilterProps {
  selected: InsuranceCategory | "전체";
  onSelect: (category: InsuranceCategory | "전체") => void;
}

export default function InsuranceFilter({
  selected,
  onSelect,
}: InsuranceFilterProps) {
  return (
    <nav aria-label="보험 유형 필터">
      <ul
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        role="tablist"
      >
        {CATEGORIES.map((category) => (
          <li key={category} role="presentation" className="shrink-0">
            <button
              role="tab"
              aria-selected={selected === category}
              onClick={() => onSelect(category)}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium transition-all duration-200 sm:px-5 sm:text-[15px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                selected === category
                  ? "bg-primary-700 text-white"
                  : "border border-border bg-transparent text-sub-text hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {selected === category && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
              {category}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
