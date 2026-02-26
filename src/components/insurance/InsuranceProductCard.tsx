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
  gender?: "m" | "f";
}

export default memo(function InsuranceProductCard({
  product,
  index,
  selected = false,
  onToggle,
  gender,
}: InsuranceProductCardProps) {
  const isPension = product.category === "연금저축보험";
  const logoSrc = product.finCoNo
    ? `/images/company/${product.finCoNo}.png`
    : null;

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
        {/* 1행: 상품명 + 핵심 수치 */}
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-card-title font-semibold leading-snug text-foreground">
            {product.productName}
          </h3>
          <span className="shrink-0 text-number font-bold tabular-nums text-foreground">
            {isPension
              ? product.avgPrftRate != null
                ? `${product.avgPrftRate}%`
                : "-"
              : (() => {
                  const premium = gender === "f" ? product.premium65f : product.premium65m;
                  return premium != null ? `${premium.toLocaleString()}원` : "-";
                })()}
          </span>
        </div>

        {/* 2행: 로고 + 회사명 */}
        <div className="mt-1 flex items-center gap-1.5">
          {logoSrc && (
            <Image
              src={logoSrc}
              alt={product.companyName}
              width={18}
              height={18}
              className="h-[18px] w-[18px] shrink-0 rounded-full"
            />
          )}
          <p className="text-body-sm leading-snug text-sub-text">
            {product.companyName}
          </p>
          {!isPension && (
            <span className="text-caption text-sub-text/60">
              · 65세 {gender === "f" ? "여성" : "남성"} 기준
            </span>
          )}
        </div>

        {/* 3행: 태그 */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-0.5 text-caption font-medium text-sub-text">
            {product.category}
          </span>
          {isPension && product.coverage && (
            <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-0.5 text-caption font-medium text-sub-text">
              {product.coverage.split(" / ")[1] ?? product.coverage}
            </span>
          )}
          {product.contractType && (
            <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-0.5 text-caption font-medium text-sub-text">
              {product.contractType === "renewal" ? "갱신형" : "비갱신형"}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
});
