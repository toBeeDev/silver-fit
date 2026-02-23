import type { Benefit, BenefitCategory, BenefitFilter } from "@/types/benefit";

/** 나이 조건 체크 */
function matchesAge(benefit: Benefit, age: number): boolean {
  if (benefit.ageRange.min > age) return false;
  if (benefit.ageRange.max !== null && benefit.ageRange.max < age) return false;
  return true;
}

/** 지역 조건 체크 */
function matchesRegion(benefit: Benefit, region: string): boolean {
  if (benefit.regions.includes("전국")) return true;
  return benefit.regions.includes(region);
}

/** 필터 조건에 맞는 혜택 필터링 */
export function filterBenefits(
  benefits: Benefit[],
  filter: BenefitFilter
): Benefit[] {
  return benefits.filter((b) => {
    if (filter.age !== undefined && !matchesAge(b, filter.age)) return false;

    if (filter.region && filter.region !== "전국" && !matchesRegion(b, filter.region))
      return false;

    if (
      filter.incomeLevel &&
      filter.incomeLevel !== "무관" &&
      !b.incomeLevels.includes("무관") &&
      !b.incomeLevels.includes(filter.incomeLevel)
    )
      return false;

    if (filter.category && b.category !== filter.category) return false;

    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      const text =
        `${b.title} ${b.summary} ${b.tags.join(" ")}`.toLowerCase();
      if (!text.includes(kw)) return false;
    }

    return true;
  });
}

/** 카테고리별 필터링 */
export function filterByCategory(
  benefits: Benefit[],
  category: BenefitCategory | "전체"
): Benefit[] {
  if (category === "전체") return benefits;
  return benefits.filter((b) => b.category === category);
}

/** 정렬 기준 */
export type SortKey = "latest" | "amount" | "name" | "age";

/** 혜택 목록 정렬 */
export function sortBenefits(benefits: Benefit[], key: SortKey): Benefit[] {
  const sorted = [...benefits];

  switch (key) {
    case "latest":
      return sorted.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    case "age":
      return sorted.sort((a, b) => a.ageRange.min - b.ageRange.min);
    case "amount":
      return sorted.sort((a, b) => {
        const numA = extractNumber(a.amount);
        const numB = extractNumber(b.amount);
        return numB - numA;
      });
    default:
      return sorted;
  }
}

/** 금액 문자열에서 숫자 추출 (정렬용) */
function extractNumber(text: string): number {
  const match = text.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** 혜택 개수를 카테고리별로 집계 */
export function countByCategory(
  benefits: Benefit[]
): Record<BenefitCategory | "전체", number> {
  const counts: Record<string, number> = { 전체: benefits.length };

  for (const b of benefits) {
    counts[b.category] = (counts[b.category] ?? 0) + 1;
  }

  return counts as Record<BenefitCategory | "전체", number>;
}
