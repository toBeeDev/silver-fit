import type {
  InsuranceProduct,
  FssAnnuityBase,
  FssAnnuityOption,
} from "@/types/insurance";
import fs from "fs";
import path from "path";

/** 금감원 API 응답 → InsuranceProduct 변환 */
function transformFssProduct(
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
      ? `월 ${Number(option.mon_paym_atm)}만원`
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

/** FSS 캐시 JSON에서 연금저축보험 로드 */
function loadFssProducts(): InsuranceProduct[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "fss-annuity-products.json",
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    const cache = JSON.parse(raw) as {
      baseList: FssAnnuityBase[];
      optionList: FssAnnuityOption[];
    };

    return (cache.baseList ?? [])
      .filter((base) => !!base.sale_strt_day)
      .map((base) => {
        const option = cache.optionList?.find(
          (o) => o.fin_prdt_cd === base.fin_prdt_cd,
        );
        return transformFssProduct(base, option);
      });
  } catch {
    // 파일 없으면 빈 배열
    return [];
  }
}

/** 전체 보험 상품 로드 (FSS 캐시) */
export function getAllInsuranceProducts(): InsuranceProduct[] {
  return loadFssProducts();
}

