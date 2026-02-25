"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      if (totalPages <= 7) return true;
      if (page === 1 || page === totalPages) return true;
      return Math.abs(page - currentPage) <= 2;
    })
    .reduce<(number | "...")[]>((acc, page, idx, arr) => {
      if (idx > 0 && page - (arr[idx - 1] ?? 0) > 1) acc.push("...");
      acc.push(page);
      return acc;
    }, []);

  return (
    <nav
      aria-label="페이지 이동"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sub-text transition-colors hover:bg-gray-100 disabled:opacity-30"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((item, idx) =>
        item === "..." ? (
          <span
            key={`dot-${idx}`}
            className="inline-flex h-10 w-6 items-center justify-center text-[14px] text-sub-text"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-full text-[14px] font-medium transition-colors",
              currentPage === item
                ? "bg-primary-700 text-white"
                : "text-sub-text hover:bg-gray-100",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sub-text transition-colors hover:bg-gray-100 disabled:opacity-30"
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
