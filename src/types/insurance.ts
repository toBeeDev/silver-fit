/** 보험 상품 카테고리 */
export type InsuranceCategory = "연금저축보험";

/** 보험 상품 타입 (목록 + 비교용) */
export interface InsuranceProduct {
  id: string;
  finCoNo: string;
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
  /** 비교용 숫자 필드 */
  avgPrftRate: number;
  dclsRate: number;
  btrmPrftRate1: number | null;
  btrmPrftRate2: number | null;
  btrmPrftRate3: number | null;
  guarRate: string;
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
  joinWay: string;
  pnsnKindNm: string;
  prdtTypeNm: string;
  etc: string | null;
  options: InsuranceOption[];
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
