"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CompareItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface CompareBarProps {
  items: CompareItem[];
  maxItems?: number;
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClear: () => void;
  compareLabel?: string;
  emptyLabel?: string;
}

export default function CompareBar({
  items,
  maxItems = 2,
  onRemove,
  onCompare,
  onClear,
  compareLabel = "VS 비교하기",
  emptyLabel = "+1 선택",
}: CompareBarProps) {
  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 shadow-lg backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-(--space-page-x) py-2.5 sm:gap-4 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-0 max-w-[140px] items-center gap-1.5 rounded-lg bg-primary-50 px-2 py-1.5 sm:max-w-none sm:gap-2 sm:px-3 sm:py-2"
                >
                  <div className="min-w-0">
                    {item.subtitle && (
                      <p className="truncate text-(--text-caption) text-sub-text">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="truncate text-(--text-label) font-medium text-foreground">
                      {item.title}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 rounded-full p-0.5 text-sub-text transition-colors hover:bg-primary-100 hover:text-foreground"
                    aria-label={`${item.title} 선택 해제`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {items.length < maxItems && (
                <div className="flex h-[36px] shrink-0 items-center rounded-lg border-2 border-dashed border-border px-2.5 text-(--text-label) text-sub-text sm:h-(--min-tap)">
                  {emptyLabel}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                onClick={onClear}
                className="rounded-lg px-2 py-1.5 text-(--text-label) text-sub-text transition-colors hover:bg-gray-100 sm:px-3 sm:py-2"
              >
                초기화
              </button>
              <button
                onClick={onCompare}
                disabled={items.length < maxItems}
                className="inline-flex min-h-[36px] items-center rounded-xl bg-primary-700 px-3 text-(--text-btn) font-medium text-white transition-colors hover:bg-primary-800 disabled:bg-gray-200 disabled:text-gray-400 sm:min-h-(--min-tap) sm:px-5"
              >
                {compareLabel}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
