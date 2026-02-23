import Link from "next/link";
import { MoveRight } from "lucide-react";
import type { Benefit } from "@/types/benefit";

export interface BenefitCardProps {
  benefit: Benefit;
  index?: number;
}

export default function BenefitCard({ benefit, index }: BenefitCardProps) {
  return (
    <Link
      href={`/benefits/${benefit.slug}`}
      className="group flex items-center gap-5 border-b border-border py-6 transition-colors first:border-t hover:bg-primary-50/30 sm:gap-6 sm:py-7"
    >
      {index !== undefined && (
        <span className="w-[48px] shrink-0 text-3xl font-extralight tabular-nums text-primary-200 sm:w-[60px] sm:text-4xl">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-sub-text">
            <span className="h-1 w-1 rounded-full bg-primary-600" />
            {benefit.category}
          </span>
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-sub-text">
            {benefit.status}
          </span>
        </div>
        <h3 className="mt-2 text-[19px] font-medium leading-tight text-foreground transition-colors group-hover:text-primary-700 sm:text-[21px]">
          {benefit.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-[15px] text-sub-text">
          {benefit.summary}
        </p>
        <span className="mt-1.5 inline-block text-[14px] font-semibold text-primary-700">
          {benefit.amount}
        </span>
      </div>
      <MoveRight className="hidden h-4 w-4 shrink-0 translate-x-0 text-sub-text opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
    </Link>
  );
}
