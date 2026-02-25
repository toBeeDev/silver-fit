import type {
  InsuranceProduct,
  InsuranceProductDetail,
  InsuranceOption,
  FssAnnuityBase,
  FssAnnuityOption,
} from "@/types/insurance";
import fs from "fs";
import path from "path";

interface FssCache {
  baseList: FssAnnuityBase[];
  optionList: FssAnnuityOption[];
}

/** 모듈 레벨 캐시 — 8.2MB JSON을 한 번만 파싱 */
let _cache: FssCache | null = null;

function loadFssCache(): FssCache {
  if (_cache) return _cache;
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "fss-annuity-products.json",
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    _cache = JSON.parse(raw) as FssCache;
    return _cache;
  } catch {
    return { baseList: [], optionList: [] };
  }
}

/** 유효한 baseList (sale_strt_day 있는 것만) */
function getValidBaseList(cache: FssCache): FssAnnuityBase[] {
  return (cache.baseList ?? []).filter((base) => !!base.sale_strt_day);
}

/** 금감원 API 응답 → InsuranceProduct 변환 */
function transformFssProduct(
  base: FssAnnuityBase,
  option: FssAnnuityOption | undefined,
  seq: number,
): InsuranceProduct {
  const features: string[] = [];
  if (base.prdt_type_nm) features.push(`상품유형: ${base.prdt_type_nm}`);
  if (base.join_way) features.push(`가입방법: ${base.join_way}`);
  if (option?.avg_prft_rate)
    features.push(`평균수익률: ${option.avg_prft_rate}%`);
  if (option?.paym_prd) features.push(`납입기간: ${option.paym_prd}`);

  const rate = option?.avg_prft_rate ?? base.avg_prft_rate ?? 0;

  return {
    id: String(seq),
    finCoNo: base.fin_co_no,
    category: "연금저축보험",
    companyName: base.kor_co_nm,
    productName: base.fin_prdt_nm,
    monthlyPremium: option?.mon_paym_atm
      ? `월 ${Number(option.mon_paym_atm)}만원`
      : "상품별 상이",
    coverage: `${base.pnsn_kind_nm} / ${base.prdt_type_nm}`,
    coverageAmount: option?.avg_prft_rate
      ? `평균수익률 ${option.avg_prft_rate}%`
      : base.avg_prft_rate != null
        ? `평균수익률 ${base.avg_prft_rate}%`
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
    avgPrftRate: base.avg_prft_rate ?? 0,
    dclsRate: base.dcls_rate ?? 0,
    btrmPrftRate1: base.btrm_prft_rate_1 ?? null,
    btrmPrftRate2: base.btrm_prft_rate_2 ?? null,
    btrmPrftRate3: base.btrm_prft_rate_3 ?? null,
    guarRate: base.guar_rate ?? "",
  };
}

/** FssAnnuityOption → InsuranceOption 변환 */
function transformFssOption(opt: FssAnnuityOption): InsuranceOption {
  return {
    entryAge: opt.pnsn_entr_age,
    entryAgeNm: opt.pnsn_entr_age_nm ?? `${opt.pnsn_entr_age}세`,
    startAge: opt.pnsn_strt_age,
    startAgeNm: opt.pnsn_strt_age_nm ?? `${opt.pnsn_strt_age}세`,
    monthlyPayment: opt.mon_paym_atm,
    monthlyPaymentNm:
      opt.mon_paym_atm_nm ??
      `${Number(opt.mon_paym_atm).toLocaleString()}원`,
    paymentPeriod: opt.paym_prd,
    paymentPeriodNm: opt.paym_prd_nm ?? `${opt.paym_prd}년`,
    receiptTerm: opt.pnsn_recp_trm,
    receiptTermNm: opt.pnsn_recp_trm_nm,
    receiptAmount: opt.pnsn_recp_amt ?? 0,
  };
}

/** 전체 보험 상품 로드 (FSS 캐시) */
export function getAllInsuranceProducts(): InsuranceProduct[] {
  const cache = loadFssCache();
  const bases = getValidBaseList(cache);
  return bases.map((base, i) => {
    const option = cache.optionList?.find(
      (o) =>
        o.fin_co_no === base.fin_co_no &&
        o.fin_prdt_cd === base.fin_prdt_cd,
    );
    return transformFssProduct(base, option, i + 1);
  });
}

/** 전체 상품 ID 목록 (generateStaticParams 용) */
export function getAllInsuranceProductIds(): string[] {
  const cache = loadFssCache();
  const bases = getValidBaseList(cache);
  return bases.map((_, i) => String(i + 1));
}

/** seq ID로 상세 상품 조회 (옵션 포함) */
export function getInsuranceProductById(
  id: string,
): InsuranceProductDetail | null {
  const seq = parseInt(id, 10);
  if (isNaN(seq) || seq < 1) return null;

  const cache = loadFssCache();
  const bases = getValidBaseList(cache);
  const idx = seq - 1;
  if (idx >= bases.length) return null;

  const base = bases[idx];
  const firstOption = cache.optionList?.find(
    (o) => o.fin_co_no === base.fin_co_no && o.fin_prdt_cd === base.fin_prdt_cd,
  );
  const product = transformFssProduct(base, firstOption, seq);

  const options = (cache.optionList ?? [])
    .filter(
      (o) =>
        o.fin_co_no === base.fin_co_no && o.fin_prdt_cd === base.fin_prdt_cd,
    )
    .map(transformFssOption);

  return {
    ...product,
    saleStartDay: base.sale_strt_day
      ? `${base.sale_strt_day.slice(0, 4)}-${base.sale_strt_day.slice(4, 6)}-${base.sale_strt_day.slice(6, 8)}`
      : null,
    mntnCnt: base.mntn_cnt ?? 0,
    joinWay: base.join_way,
    pnsnKindNm: base.pnsn_kind_nm,
    prdtTypeNm: base.prdt_type_nm,
    etc: base.etc ?? null,
    options,
  };
}
