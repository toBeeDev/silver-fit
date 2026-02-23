import BenefitCard from "@/components/benefits/BenefitCard";
import type { Benefit } from "@/types/benefit";

export interface BenefitListProps {
  benefits: Benefit[];
  numbered?: boolean;
}

export default function BenefitList({
  benefits,
  numbered = true,
}: BenefitListProps) {
  if (benefits.length === 0) {
    return (
      <div
        className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-border p-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-[17px] font-medium text-sub-text">
          조건에 맞는 혜택이 없습니다.
        </p>
        <p className="mt-1 text-[15px] text-sub-text/70">
          다른 조건으로 다시 검색해 보세요
        </p>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      {benefits.map((benefit, i) => (
        <BenefitCard
          key={benefit.id}
          benefit={benefit}
          index={numbered ? i : undefined}
        />
      ))}
    </div>
  );
}
