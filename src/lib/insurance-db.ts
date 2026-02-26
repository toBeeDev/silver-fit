import { supabase } from "./supabase";
import {
  INSURANCE_TYPE_MAP,
  INSURANCE_CATEGORY_TO_TYPE,
} from "@/types/insurance";
import type {
  InsuranceProduct,
  InsuranceProductDetail,
  InsuranceOption,
  InsuranceCategory,
} from "@/types/insurance";
import type { InsuranceProductRow, InsuranceOptionRow } from "@/types/supabase";

// ─── Row → 프론트 타입 변환 ────────────────────────────────

function rowToProduct(row: InsuranceProductRow): InsuranceProduct {
  const isPension = row.insurance_type === "pension";
  const rate = row.avg_prft_rate ?? 0;

  let monthlyPremium = "상품별 상이";
  if (!isPension && row.premium_65m != null) {
    monthlyPremium = `월 ${row.premium_65m.toLocaleString()}원`;
  }

  let coverage = "";
  if (isPension) {
    coverage = `${row.pnsn_kind_nm ?? ""} / ${row.prdt_type_nm ?? ""}`;
  } else if (row.coverage) {
    const c = row.coverage as Record<string, unknown>;
    coverage = Object.values(c)
      .map((v) => {
        if (typeof v === "object" && v !== null) {
          return Object.values(v as Record<string, unknown>).join(", ");
        }
        return String(v);
      })
      .join(" | ");
  }

  let coverageAmount = "문의 필요";
  if (isPension && row.avg_prft_rate != null) {
    coverageAmount = `평균수익률 ${row.avg_prft_rate}%`;
  } else if (row.premium_65m != null) {
    coverageAmount = `65세 남성 월 ${row.premium_65m.toLocaleString()}원`;
  }

  const features: string[] = [];
  if (isPension) {
    if (row.prdt_type_nm) features.push(`상품유형: ${row.prdt_type_nm}`);
    if (row.join_way) features.push(`가입방법: ${row.join_way}`);
    if (row.avg_prft_rate) features.push(`평균수익률: ${row.avg_prft_rate}%`);
  } else {
    if (row.contract_type === "renewal") features.push("갱신형");
    if (row.contract_type === "non_renewal") features.push("비갱신형");
    if (row.payment_period) features.push(`납입기간: ${row.payment_period}`);
  }

  return {
    id: row.id,
    source: row.source,
    category: INSURANCE_TYPE_MAP[row.insurance_type] ?? "연금저축보험",
    companyName: row.company,
    productName: row.product_name,
    monthlyPremium,
    coverage,
    coverageAmount,
    features,
    rating: isPension
      ? rate >= 3.5 ? "우수" : rate >= 2 ? "양호" : "보통"
      : "보통",
    minAge: row.min_age ?? 18,
    maxAge: row.max_age ?? 80,
    websiteUrl: row.source_url ?? "https://finlife.fss.or.kr",
    updatedAt: row.updated_at?.slice(0, 10) ?? "",
    premium65m: row.premium_65m ?? null,
    premium65f: row.premium_65f ?? null,
    contractType: row.contract_type as "renewal" | "non_renewal" | null,
    avgPrftRate: row.avg_prft_rate != null ? Number(row.avg_prft_rate) : null,
    dclsRate: row.dcls_rate != null ? Number(row.dcls_rate) : null,
    btrmPrftRate1: row.btrm_prft_rate_1 != null ? Number(row.btrm_prft_rate_1) : null,
    btrmPrftRate2: row.btrm_prft_rate_2 != null ? Number(row.btrm_prft_rate_2) : null,
    btrmPrftRate3: row.btrm_prft_rate_3 != null ? Number(row.btrm_prft_rate_3) : null,
    guarRate: row.guar_rate ?? null,
    coverageDetail: row.coverage ?? null,
    conditions: row.conditions ?? null,
    finCoNo: row.product_code?.split("-")[0] ?? undefined,
  };
}

function optionRowToOption(row: InsuranceOptionRow): InsuranceOption {
  return {
    entryAge: row.entry_age ?? "",
    entryAgeNm: row.entry_age_nm ?? "",
    startAge: row.start_age ?? "",
    startAgeNm: row.start_age_nm ?? "",
    monthlyPayment: row.monthly_payment ?? "",
    monthlyPaymentNm: row.monthly_payment_nm ?? "",
    paymentPeriod: row.payment_period ?? "",
    paymentPeriodNm: row.payment_period_nm ?? "",
    receiptTerm: row.receipt_term ?? "",
    receiptTermNm: row.receipt_term_nm ?? "",
    receiptAmount: row.receipt_amount != null ? Number(row.receipt_amount) : 0,
  };
}

// ─── 쿼리 함수 ─────────────────────────────────────────────

/** 전체 보험 상품 조회 (활성 상품만) */
export async function getAllInsuranceProducts(): Promise<InsuranceProduct[]> {
  const { data, error } = await supabase
    .from("insurance_products")
    .select("*")
    .eq("is_active", true)
    .order("company", { ascending: true });

  if (error) throw new Error(`상품 조회 실패: ${error.message}`);
  return (data ?? []).map((row) => rowToProduct(row as InsuranceProductRow));
}

/** 카테고리별 상품 조회 */
export async function getInsuranceProductsByType(
  category: InsuranceCategory,
): Promise<InsuranceProduct[]> {
  const type = INSURANCE_CATEGORY_TO_TYPE[category];
  const { data, error } = await supabase
    .from("insurance_products")
    .select("*")
    .eq("is_active", true)
    .eq("insurance_type", type)
    .order("company", { ascending: true });

  if (error) throw new Error(`상품 조회 실패: ${error.message}`);
  return (data ?? []).map((row) => rowToProduct(row as InsuranceProductRow));
}

/** 상품 ID로 상세 조회 (옵션 포함) */
export async function getInsuranceProductById(
  id: string,
): Promise<InsuranceProductDetail | null> {
  const { data: row, error } = await supabase
    .from("insurance_products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) return null;

  const typedRow = row as unknown as InsuranceProductRow;
  const product = rowToProduct(typedRow);

  // 옵션 조회 (연금 상품만)
  let options: InsuranceOption[] = [];
  if (typedRow.insurance_type === "pension") {
    const { data: optRows } = await supabase
      .from("insurance_options")
      .select("*")
      .eq("product_id", id);

    options = (optRows ?? []).map((o) => optionRowToOption(o as InsuranceOptionRow));
  }

  return {
    ...product,
    saleStartDay: typedRow.sale_start_day ?? null,
    mntnCnt: typedRow.mntn_cnt != null ? Number(typedRow.mntn_cnt) : 0,
    joinWay: typedRow.join_way ?? null,
    pnsnKindNm: typedRow.pnsn_kind_nm ?? null,
    prdtTypeNm: typedRow.prdt_type_nm ?? null,
    etc: typedRow.etc ?? null,
    options,
  };
}

/** 전체 상품 ID 목록 (generateStaticParams용) */
export async function getAllInsuranceProductIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from("insurance_products")
    .select("id")
    .eq("is_active", true);

  if (error) throw new Error(`ID 조회 실패: ${error.message}`);
  return (data ?? []).map((row) => (row as unknown as { id: string }).id);
}

/** 비교 API: 최대 3개 상품 비교 데이터 */
export async function getCompareProducts(
  ids: string[],
): Promise<InsuranceProductDetail[]> {
  const limited = ids.slice(0, 3);
  const results = await Promise.all(
    limited.map((id) => getInsuranceProductById(id)),
  );
  return results.filter((p): p is InsuranceProductDetail => p != null);
}
