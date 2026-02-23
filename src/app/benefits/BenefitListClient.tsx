"use client";

import { useState } from "react";
import BenefitFilter from "@/components/benefits/BenefitFilter";
import BenefitList from "@/components/benefits/BenefitList";
import { filterByCategory } from "@/lib/benefits";
import type { Benefit, BenefitCategory } from "@/types/benefit";

interface BenefitListClientProps {
  benefits: Benefit[];
}

export default function BenefitListClient({
  benefits,
}: BenefitListClientProps) {
  const [selected, setSelected] = useState<BenefitCategory | "전체">("전체");

  const filtered = filterByCategory(benefits, selected);

  return (
    <>
      <BenefitFilter selected={selected} onSelect={setSelected} />
      <div className="mt-8">
        <p className="mb-6 text-[15px] text-sub-text" aria-live="polite">
          총 <strong className="font-semibold text-foreground">{filtered.length}</strong>개
          혜택
        </p>
        <BenefitList benefits={filtered} />
      </div>
    </>
  );
}
