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
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        role="tablist"
      >
        {categories.map((category) => (
          <li key={category} role="presentation" className="shrink-0">
            <button
              role="tab"
              aria-selected={selected === category}
              onClick={() => onSelect(category)}
              className={cn(
                "inline-flex min-h-(--min-tap) items-center gap-1.5 rounded-full px-3 text-(--text-btn) font-medium transition-all duration-200 sm:px-5",
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
