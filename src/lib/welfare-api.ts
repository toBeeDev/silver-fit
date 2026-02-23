import type { Benefit, BenefitFilter } from "@/types/benefit";
import { filterBenefits } from "@/lib/benefits";
import benefitsData from "@/data/benefits.json";

const allBenefits: Benefit[] = benefitsData as Benefit[];

/** 혜택 목록 조회 (페이지네이션) */
export function getBenefits(
  page = 1,
  perPage = 20
): { benefits: Benefit[]; totalCount: number } {
  const start = (page - 1) * perPage;
  return {
    benefits: allBenefits.slice(start, start + perPage),
    totalCount: allBenefits.length,
  };
}

/** slug로 단일 혜택 조회 */
export function getBenefitBySlug(slug: string): Benefit | null {
  return allBenefits.find((b) => b.slug === slug) ?? null;
}

/** 모든 slug 조회 (generateStaticParams 용) */
export function getAllBenefitSlugs(): string[] {
  return allBenefits.map((b) => b.slug);
}

/** 필터 조건에 맞는 혜택 목록 필터링 */
export function getFilteredBenefits(filter: BenefitFilter): Benefit[] {
  return filterBenefits(allBenefits, filter);
}
