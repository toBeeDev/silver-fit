import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MoveRight } from "lucide-react";
import type { InsuranceProduct } from "@/types/insurance";

const categoryColors: Record<string, string> = {
  간병보험: "bg-amber-50 text-amber-700",
  실손보험: "bg-rose-50 text-rose-700",
  치매보험: "bg-violet-50 text-violet-700",
  연금저축보험: "bg-teal-50 text-teal-700",
};

const ratingColors: Record<string, string> = {
  우수: "bg-emerald-50 text-emerald-700",
  양호: "bg-blue-50 text-blue-700",
  보통: "bg-gray-50 text-gray-600",
};

export interface InsuranceProductCardProps {
  product: InsuranceProduct;
}

export default function InsuranceProductCard({
  product,
}: InsuranceProductCardProps) {
  return (
    <Card as="article" className="flex flex-col gap-4 hover:translate-y-0">
      {/* 배지 */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
            categoryColors[product.category] ?? "bg-gray-50 text-gray-600",
          )}
        >
          {product.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
            ratingColors[product.rating] ?? "bg-gray-50 text-gray-600",
          )}
        >
          {product.rating}
        </span>
        {product.dataSource === "fss" && (
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
            금감원 공시
          </span>
        )}
      </div>

      {/* 보험사 + 상품명 */}
      <div>
        <p className="text-[14px] text-sub-text">{product.companyName}</p>
        <h3 className="mt-1 text-[18px] font-medium leading-tight text-foreground">
          {product.productName}
        </h3>
      </div>

      {/* 보험료 + 보장 */}
      <div className="flex flex-col gap-2 rounded-xl bg-primary-50/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-sub-text">월 보험료</span>
          <span className="text-[17px] font-semibold text-primary-700">
            {product.monthlyPremium}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-sub-text">보장</span>
          <span className="text-[15px] font-medium text-foreground">
            {product.coverageAmount}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-[15px] leading-relaxed text-sub-text">
        {product.coverage}
      </p>

      {/* 특징 */}
      <ul className="flex flex-col gap-1.5">
        {product.features.map((f) => (
          <li
            key={f}
            className="inline-flex items-start gap-2 text-[14px] text-sub-text"
          >
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary-600" />
            {f}
          </li>
        ))}
      </ul>

      {/* 가입 나이 */}
      <p className="text-[13px] text-sub-text">
        가입 가능: 만 {product.minAge}세 ~ {product.maxAge}세
      </p>

      {/* CTA */}
      <a
        href={product.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto"
      >
        <Button variant="outline" size="sm" className="w-full gap-2">
          보험사 홈페이지 <MoveRight className="h-3.5 w-3.5" />
        </Button>
      </a>
    </Card>
  );
}
