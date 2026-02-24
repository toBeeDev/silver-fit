/** 보험 상품 카테고리 */
export type InsuranceCategory = "연금저축보험";

/** 보험 상품 타입 */
export interface InsuranceProduct {
  id: string;
  category: InsuranceCategory;
  companyName: string;
  productName: string;
  monthlyPremium: string;
  coverage: string;
  coverageAmount: string;
  features: string[];
  rating: "우수" | "양호" | "보통";
  minAge: number;
  maxAge: number;
  websiteUrl: string;
  dataSource: "fss";
  updatedAt: string;
}

/** 보험 상품 필터 */
export interface InsuranceFilter {
  category?: InsuranceCategory | "전체";
  age?: number;
}

/** 금감원 API — 연금저축보험 기본 정보 */
export interface FssAnnuityBase {
  fin_co_no: string;
  fin_prdt_cd: string;
  kor_co_nm: string;
  fin_prdt_nm: string;
  join_way: string;
  pnsn_kind: string;
  pnsn_kind_nm: string;
  sale_strt_day: string;
  prdt_type: string;
  prdt_type_nm: string;
  dcls_month: string;
}

/** 금감원 API — 연금저축보험 옵션 정보 */
export interface FssAnnuityOption {
  fin_co_no: string;
  fin_prdt_cd: string;
  pnsn_rcv_trm: string;
  pnsn_rcv_trm_nm: string;
  pnsn_entr_age: string;
  pnsn_strt_age: string;
  mon_paym_atm: string;
  paym_prd: string;
  avg_prft_rate: number;
}

/** 금감원 API 응답 */
export interface FssApiResponse {
  result: {
    err_cd: string;
    err_msg: string;
    total_count: string;
    max_page_no: string;
    now_page_no: string;
    baseList: FssAnnuityBase[];
    optionList: FssAnnuityOption[];
  };
}
