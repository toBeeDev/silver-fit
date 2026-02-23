"use client";

import { cn } from "@/lib/utils";
import type { BenefitCategory } from "@/types/benefit";

const CATEGORIES: (BenefitCategory | "전체")[] = [
  "전체",
  "생활지원",
  "의료건강",
  "주거지원",
  "일자리",
  "문화여가",
  "돌봄서비스",
  "교통",
];

export interface BenefitFilterProps {
  selected: BenefitCategory | "전체";
  onSelect: (category: BenefitCategory | "전체") => void;
}

export default function BenefitFilter({
  selected,
  onSelect,
}: BenefitFilterProps) {
  return (
    <nav aria-label="혜택 카테고리 필터">
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
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-5 text-[15px] font-medium transition-all duration-200",
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
