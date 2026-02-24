import type { InsuranceProduct, InsuranceFilter } from "@/types/insurance";

/** 보험 상품 필터링 (클라이언트/서버 공용) */
export function filterInsuranceProducts(
  products: InsuranceProduct[],
  filter: InsuranceFilter,
): InsuranceProduct[] {
  return products.filter((p) => {
    if (
      filter.category &&
      filter.category !== "전체" &&
      p.category !== filter.category
    )
      return false;
    if (
      filter.age !== undefined &&
      (p.minAge > filter.age || p.maxAge < filter.age)
    )
      return false;
    return true;
  });
}
