import type {
  InsuranceProduct,
  InsuranceFilter,
  FssAnnuityBase,
  FssAnnuityOption,
} from "@/types/insurance";
import data from "@/data/insurance-products.json";

const staticProducts = data as InsuranceProduct[];

/** 정적 보험 상품 데이터 로드 (간병·실손·치매) */
export function getStaticInsuranceProducts(): InsuranceProduct[] {
  return staticProducts;
}

/** 금감원 API 응답 → InsuranceProduct 변환 */
export function transformFssProduct(
  base: FssAnnuityBase,
  option?: FssAnnuityOption,
): InsuranceProduct {
  const features: string[] = [];
  if (base.prdt_type_nm) features.push(`상품유형: ${base.prdt_type_nm}`);
  if (base.join_way) features.push(`가입방법: ${base.join_way}`);
  if (option?.avg_prft_rate)
    features.push(`평균수익률: ${option.avg_prft_rate}%`);
  if (option?.paym_prd) features.push(`납입기간: ${option.paym_prd}`);

  const rate = option?.avg_prft_rate ?? 0;

  return {
    id: `fss-${base.fin_co_no}-${base.fin_prdt_cd}`,
    category: "연금저축보험",
    companyName: base.kor_co_nm,
    productName: base.fin_prdt_nm,
    monthlyPremium: option?.mon_paym_atm
      ? `${Number(option.mon_paym_atm).toLocaleString()}원`
      : "상품별 상이",
    coverage: `${base.pnsn_kind_nm} / ${base.prdt_type_nm}`,
    coverageAmount: option?.avg_prft_rate
      ? `평균수익률 ${option.avg_prft_rate}%`
      : "문의 필요",
    features,
    rating: rate >= 3.5 ? "우수" : rate >= 2 ? "양호" : "보통",
    minAge: 18,
    maxAge: 80,
    websiteUrl: "https://finlife.fss.or.kr",
    dataSource: "fss",
    updatedAt: base.dcls_month
      ? `${base.dcls_month.slice(0, 4)}-${base.dcls_month.slice(4, 6)}-01`
      : new Date().toISOString().slice(0, 10),
  };
}

/** 보험 상품 필터링 */
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
