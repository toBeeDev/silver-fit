/** 보험 상품 카테고리 (4종) */
export type InsuranceCategory = "간병보험" | "치매보험" | "실손보험" | "연금저축보험";

/** DB insurance_type ↔ 한글 카테고리 매핑 */
export const INSURANCE_TYPE_MAP: Record<string, InsuranceCategory> = {
  care: "간병보험",
  dementia: "치매보험",
  medical: "실손보험",
  pension: "연금저축보험",
};

export const INSURANCE_CATEGORY_TO_TYPE: Record<InsuranceCategory, string> = {
  간병보험: "care",
  치매보험: "dementia",
  실손보험: "medical",
  연금저축보험: "pension",
};

/** 보험 상품 타입 (목록 + 비교용) */
export interface InsuranceProduct {
  id: string;
  source: "fss_api" | "manual";
  category: InsuranceCategory;
  companyName: string;
  productName: string;
  /** 연금: "월 X만원" / 간병·치매·실손: "월 X원" */
  monthlyPremium: string;
  coverage: string;
  coverageAmount: string;
  features: string[];
  rating: "우수" | "양호" | "보통";
  minAge: number;
  maxAge: number;
  websiteUrl: string;
  updatedAt: string;
  /** 간병·치매·실손: 65세 남성 보험료 */
  premium65m: number | null;
  /** 간병·치매·실손: 65세 여성 보험료 */
  premium65f: number | null;
  /** 갱신/비갱신 */
  contractType: "renewal" | "non_renewal" | null;
  /** 연금 전용: 비교용 숫자 필드 */
  avgPrftRate: number | null;
  dclsRate: number | null;
  btrmPrftRate1: number | null;
  btrmPrftRate2: number | null;
  btrmPrftRate3: number | null;
  guarRate: string | null;
  /** 보장 내용 (구조화) */
  coverageDetail: Record<string, unknown> | null;
  /** 가입 조건 */
  conditions: string | null;
  /** 레거시 호환 */
  finCoNo?: string;
}

/** 연금 옵션 (시뮬레이터용) */
export interface InsuranceOption {
  entryAge: string;
  entryAgeNm: string;
  startAge: string;
  startAgeNm: string;
  monthlyPayment: string;
  monthlyPaymentNm: string;
  paymentPeriod: string;
  paymentPeriodNm: string;
  receiptTerm: string;
  receiptTermNm: string;
  receiptAmount: number;
}

/** 상세 페이지용 전체 필드 */
export interface InsuranceProductDetail extends InsuranceProduct {
  saleStartDay: string | null;
  mntnCnt: number;
  joinWay: string | null;
  pnsnKindNm: string | null;
  prdtTypeNm: string | null;
  etc: string | null;
  options: InsuranceOption[];
}

/** 보험 상품 필터 */
export interface InsuranceFilter {
  category?: InsuranceCategory | "전체";
  age?: number;
  gender?: "m" | "f";
  sort?: "premium_asc" | "premium_desc" | "rate_desc" | "rate_asc";
}

// ─── 금감원 API 타입 (크롤링 전용) ─────────────────────────

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
  mntn_cnt: number;
  prdt_type: string;
  prdt_type_nm: string;
  avg_prft_rate: number;
  dcls_rate: number;
  guar_rate: string;
  btrm_prft_rate_1: number | null;
  btrm_prft_rate_2: number | null;
  btrm_prft_rate_3: number | null;
  etc: string | null;
  dcls_month: string;
}

/** 금감원 API — 연금저축보험 옵션 정보 */
export interface FssAnnuityOption {
  fin_co_no: string;
  fin_prdt_cd: string;
  pnsn_recp_trm: string;
  pnsn_recp_trm_nm: string;
  pnsn_entr_age: string;
  pnsn_entr_age_nm: string;
  pnsn_strt_age: string;
  pnsn_strt_age_nm: string;
  mon_paym_atm: string;
  mon_paym_atm_nm: string;
  paym_prd: string;
  paym_prd_nm: string;
  avg_prft_rate: number;
  pnsn_recp_amt: number;
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
