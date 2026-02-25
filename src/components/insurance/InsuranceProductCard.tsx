import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { InsuranceProduct } from "@/types/insurance";

export interface InsuranceProductCardProps {
  product: InsuranceProduct;
  index: number;
  selected?: boolean;
  onToggle?: (id: string) => void;
}

export default memo(function InsuranceProductCard({
  product,
  index,
  selected = false,
  onToggle,
}: InsuranceProductCardProps) {
  const logoSrc = `/images/company/${product.finCoNo}.png`;

  return (
    <div className="flex items-center gap-3 border-b border-border/60 py-(--space-card-pad) transition-colors first:border-t hover:bg-white/40">
      {/* 비교 선택 */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle?.(product.id);
        }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border transition-all",
          "h-(--min-tap) w-(--min-tap) [--min-tap:28px] sm:[--min-tap:32px]",
          selected
            ? "border-primary-700 bg-primary-700 text-white"
            : "border-border bg-white text-gray-300 hover:border-primary-300 hover:text-primary-400",
        )}
        aria-label={selected ? "비교 선택 해제" : "비교 선택"}
      >
        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>

      {/* 본문 영역 */}
      <Link
        href={`/insurance/${product.id}`}
        className="min-w-0 flex-1"
      >
        {/* 1행: 상품명 + 수익률 */}
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-(--text-card-title) font-semibold leading-snug text-foreground">
            {product.productName}
          </h3>
          <span className="shrink-0 text-(--text-number) font-bold tabular-nums text-foreground">
            {product.avgPrftRate != null ? `${product.avgPrftRate}%` : "-"}
          </span>
        </div>

        {/* 2행: 로고 + 회사명 */}
        <div className="mt-1 flex items-center gap-1.5">
          <Image
            src={logoSrc}
            alt={product.companyName}
            width={18}
            height={18}
            className="h-[18px] w-[18px] shrink-0 rounded-full"
          />
          <p className="text-(--text-body-sm) leading-snug text-sub-text">
            {product.companyName}
          </p>
        </div>

        {/* 3행: 태그 */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-0.5 text-(--text-caption) font-medium text-sub-text">
            {product.category}
          </span>
          <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-0.5 text-(--text-caption) font-medium text-sub-text">
            {product.coverage.split(" / ")[1] ?? product.coverage}
          </span>
        </div>
      </Link>
    </div>
  );
});
