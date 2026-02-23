import { cn } from "@/lib/utils";
import type { BenefitCategory, BenefitStatus } from "@/types/benefit";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "category" | "status";
  category?: BenefitCategory;
  status?: BenefitStatus;
}

const categoryColors: Record<BenefitCategory, string> = {
  생활지원: "bg-blue-50 text-blue-700 ring-blue-200",
  의료건강: "bg-rose-50 text-rose-700 ring-rose-200",
  주거지원: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  일자리: "bg-violet-50 text-violet-700 ring-violet-200",
  문화여가: "bg-pink-50 text-pink-700 ring-pink-200",
  돌봄서비스: "bg-amber-50 text-amber-700 ring-amber-200",
  교통: "bg-teal-50 text-teal-700 ring-teal-200",
  기타: "bg-gray-50 text-gray-600 ring-gray-200",
};

const statusColors: Record<BenefitStatus, string> = {
  진행중: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  예정: "bg-amber-50 text-amber-700 ring-amber-200",
  마감: "bg-gray-100 text-gray-500 ring-gray-200",
};

export default function Badge({
  variant = "category",
  category,
  status,
  className,
  children,
  ...props
}: BadgeProps) {
  const colorClass =
    variant === "status" && status
      ? statusColors[status]
      : category
        ? categoryColors[category]
        : "bg-gray-50 text-gray-600 ring-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold ring-1 ring-inset",
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
