"use client";

import { cn } from "@/lib/utils";

export interface CategoryFilterProps<T extends string> {
  categories: readonly T[];
  selected: T;
  onSelect: (category: T) => void;
  ariaLabel?: string;
}

export default function CategoryFilter<T extends string>({
  categories,
  selected,
  onSelect,
  ariaLabel = "카테고리 필터",
}: CategoryFilterProps<T>) {
  return (
    <nav aria-label={ariaLabel}>
      <ul
        className="flex gap-1.5 overflow-x-auto scrollbar-none"
        role="tablist"
      >
        {categories.map((category) => (
          <li key={category} role="presentation" className="shrink-0">
            <button
              role="tab"
              aria-selected={selected === category}
              onClick={() => onSelect(category)}
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium transition-all duration-200 sm:px-3.5 sm:py-1.5 sm:text-label",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                selected === category
                  ? "bg-primary-700 text-white"
                  : "bg-gray-100 text-sub-text hover:bg-gray-200 hover:text-foreground",
              )}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
