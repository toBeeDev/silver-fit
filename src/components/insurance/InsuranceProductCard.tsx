import { cn } from "@/lib/utils";
import { MoveRight } from "lucide-react";
import type { InsuranceProduct } from "@/types/insurance";

const categoryColors: Record<string, string> = {
  연금저축보험: "bg-teal-50 text-teal-700",
};

export interface InsuranceProductCardProps {
  product: InsuranceProduct;
  index: number;
}

export default function InsuranceProductCard({
  product,
  index,
}: InsuranceProductCardProps) {
  return (
    <a
      href={product.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 border-b border-border/60 py-6 transition-colors first:border-t hover:bg-white/40 sm:gap-5 sm:py-7"
    >
      {/* 번호 */}
      <span className="w-[48px] shrink-0 pt-1 text-3xl font-extralight tabular-nums text-primary-200 sm:w-[56px] sm:text-4xl">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* 본문 */}
      <div className="min-w-0 flex-1">
        {/* 배지 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              categoryColors[product.category] ?? "bg-gray-50 text-gray-600",
            )}
          >
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-medium text-sub-text">
            <span className="h-1 w-1 rounded-full bg-primary-600" />
            {product.companyName}
          </span>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
            금감원
          </span>
        </div>

        {/* 상품명 */}
        <h3 className="mt-2 text-[17px] font-medium leading-tight text-foreground transition-colors group-hover:text-primary-700 sm:text-[19px]">
          {product.productName}
        </h3>

        {/* 핵심 정보 */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[15px] font-semibold text-primary-700">
            {product.monthlyPremium}
          </span>
          <span className="text-[14px] text-sub-text">
            {product.coverageAmount}
          </span>
        </div>

        {/* 특징 태그 */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {product.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[12px] text-sub-text"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* 화살표 */}
      <MoveRight className="mt-2 hidden h-4 w-4 shrink-0 translate-x-0 text-sub-text opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
    </a>
  );
}
