/**
 * 금감원 금융상품한눈에 API → Supabase 직접 동기화
 *
 * Usage:
 *   FSS_API_KEY=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/crawl-fss.ts
 */

import { createClient } from "@supabase/supabase-js";

const FSS_API_BASE = "http://finlife.fss.or.kr/finlifeapi";
const API_KEY = process.env.FSS_API_KEY;
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://bklmtyecrxcdtdptrkzn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FIN_GROUPS = [
  { code: "050000", name: "생명보험" },
  { code: "060000", name: "손해보험" },
];

const BATCH_SIZE = 50;

interface FssBase {
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

interface FssOption {
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

interface FssResult {
  err_cd: string;
  err_msg: string;
  total_count: string;
  max_page_no: string;
  now_page_no: string;
  baseList: FssBase[];
  optionList: FssOption[];
}

async function fetchPage(
  topFinGrpNo: string,
  pageNo: number,
): Promise<FssResult | null> {
  const url = `${FSS_API_BASE}/annuitySavingProductsSearch.json?auth=${API_KEY}&topFinGrpNo=${topFinGrpNo}&pageNo=${pageNo}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  HTTP ${res.status} for page ${pageNo}`);
      return null;
    }
    const data = await res.json();
    if (data.result?.err_cd !== "000") {
      console.error(
        `  API 오류: ${data.result?.err_cd} - ${data.result?.err_msg}`,
      );
      return null;
    }
    return data.result as FssResult;
  } catch (e) {
    console.error(`  Fetch 오류:`, e);
    return null;
  }
}

async function crawlGroup(groupCode: string, groupName: string) {
  console.log(`\n[${groupName}] 권역코드 ${groupCode} 조회 시작`);

  const allBase: FssBase[] = [];
  const allOptions: FssOption[] = [];

  const first = await fetchPage(groupCode, 1);
  if (!first) {
    console.error(`  첫 페이지 조회 실패, 건너뜀`);
    return { baseList: [], optionList: [] };
  }

  const maxPage = parseInt(first.max_page_no, 10) || 1;
  const totalCount = parseInt(first.total_count, 10) || 0;
  console.log(`  총 ${totalCount}건, ${maxPage}페이지`);

  allBase.push(...first.baseList);
  allOptions.push(...first.optionList);

  for (let page = 2; page <= maxPage; page++) {
    console.log(`  페이지 ${page}/${maxPage} 조회 중...`);
    const result = await fetchPage(groupCode, page);
    if (result) {
      allBase.push(...result.baseList);
      allOptions.push(...result.optionList);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `  완료: 기본정보 ${allBase.length}건, 옵션 ${allOptions.length}건`,
  );
  return { baseList: allBase, optionList: allOptions };
}

async function main() {
  if (!API_KEY) {
    console.error("❌ FSS_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }
  if (!SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  console.log("=== 금감원 연금저축보험 → Supabase 동기화 시작 ===");
  console.log(`시간: ${new Date().toISOString()}`);

  // 1. FSS API에서 데이터 수집
  const allBase: FssBase[] = [];
  const allOptions: FssOption[] = [];

  for (const group of FIN_GROUPS) {
    const result = await crawlGroup(group.code, group.name);
    allBase.push(...result.baseList);
    allOptions.push(...result.optionList);
  }

  const validBases = allBase.filter((b) => !!b.sale_strt_day);
  console.log(`\n📊 수집 완료: 전체 ${allBase.length}건, 유효 ${validBases.length}건`);

  // 2. 기존 상품 조회 (product_code 기준 매핑)
  const { data: existingProducts } = await supabase
    .from("insurance_products")
    .select("id, product_code")
    .eq("source", "fss_api")
    .eq("insurance_type", "pension");

  const existingMap = new Map<string, string>();
  for (const p of existingProducts ?? []) {
    if (p.product_code) existingMap.set(p.product_code, p.id);
  }

  // 3. Upsert 상품
  console.log("\n📦 상품 upsert 시작...");
  let upserted = 0;
  let created = 0;
  const productIdMap = new Map<string, string>();

  for (let i = 0; i < validBases.length; i += BATCH_SIZE) {
    const batch = validBases.slice(i, i + BATCH_SIZE);
    const rows = batch.map((base) => {
      const code = `${base.fin_co_no}-${base.fin_prdt_cd}`;
      const existingId = existingMap.get(code);
      return {
        ...(existingId ? { id: existingId } : {}),
        source: "fss_api" as const,
        product_code: code,
        company: base.kor_co_nm,
        product_name: base.fin_prdt_nm,
        insurance_type: "pension" as const,
        min_age: 18,
        max_age: 80,
        source_url: "https://finlife.fss.or.kr",
        is_active: true,
        avg_prft_rate: base.avg_prft_rate ?? null,
        dcls_rate: base.dcls_rate ?? null,
        guar_rate: base.guar_rate ?? null,
        btrm_prft_rate_1: base.btrm_prft_rate_1 ?? null,
        btrm_prft_rate_2: base.btrm_prft_rate_2 ?? null,
        btrm_prft_rate_3: base.btrm_prft_rate_3 ?? null,
        sale_start_day: base.sale_strt_day ?? null,
        mntn_cnt: base.mntn_cnt ?? null,
        join_way: base.join_way ?? null,
        pnsn_kind_nm: base.pnsn_kind_nm ?? null,
        prdt_type_nm: base.prdt_type_nm ?? null,
        etc: base.etc ?? null,
      };
    });

    const { data: result, error } = await supabase
      .from("insurance_products")
      .upsert(rows, { onConflict: "id", defaultToNull: false })
      .select("id, product_code");

    if (error) {
      console.error(`❌ upsert 에러 (batch ${i / BATCH_SIZE + 1}):`, error.message);
      continue;
    }

    for (const row of result ?? []) {
      if (row.product_code) {
        productIdMap.set(row.product_code, row.id);
        if (!existingMap.has(row.product_code)) created++;
      }
    }
    upserted += (result ?? []).length;
    process.stdout.write(`\r  ${upserted}/${validBases.length}`);
  }
  console.log(`\n✅ 상품 ${upserted}건 (신규 ${created}건)`);

  // 4. 옵션 동기화 (기존 삭제 후 재삽입)
  console.log("\n📦 옵션 동기화 시작...");
  const productIds = [...productIdMap.values()];

  // 기존 옵션 삭제
  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    const batch = productIds.slice(i, i + BATCH_SIZE);
    await supabase
      .from("insurance_options")
      .delete()
      .in("product_id", batch);
  }

  // 새 옵션 삽입
  let insertedOptions = 0;
  for (let i = 0; i < allOptions.length; i += BATCH_SIZE) {
    const batch = allOptions.slice(i, i + BATCH_SIZE);
    const rows: Array<Record<string, unknown>> = [];

    for (const opt of batch) {
      const key = `${opt.fin_co_no}-${opt.fin_prdt_cd}`;
      const productId = productIdMap.get(key);
      if (!productId) continue;

      rows.push({
        product_id: productId,
        entry_age: opt.pnsn_entr_age ?? null,
        entry_age_nm: opt.pnsn_entr_age_nm ?? null,
        start_age: opt.pnsn_strt_age ?? null,
        start_age_nm: opt.pnsn_strt_age_nm ?? null,
        monthly_payment: opt.mon_paym_atm ?? null,
        monthly_payment_nm: opt.mon_paym_atm_nm ?? null,
        payment_period: opt.paym_prd ?? null,
        payment_period_nm: opt.paym_prd_nm ?? null,
        receipt_term: opt.pnsn_recp_trm ?? null,
        receipt_term_nm: opt.pnsn_recp_trm_nm ?? null,
        receipt_amount: opt.pnsn_recp_amt ?? null,
      });
    }

    if (rows.length === 0) continue;

    const { error } = await supabase.from("insurance_options").insert(rows);
    if (error) {
      console.error(`❌ 옵션 삽입 에러:`, error.message);
      continue;
    }
    insertedOptions += rows.length;
    process.stdout.write(`\r  ${insertedOptions}건`);
  }
  console.log(`\n✅ 옵션 ${insertedOptions}건`);

  // 5. FSS에 없는 상품 비활성화
  const crawledCodes = new Set(
    validBases.map((b) => `${b.fin_co_no}-${b.fin_prdt_cd}`),
  );
  const toDeactivate = [...existingMap.entries()]
    .filter(([code]) => !crawledCodes.has(code))
    .map(([, id]) => id);

  if (toDeactivate.length > 0) {
    await supabase
      .from("insurance_products")
      .update({ is_active: false })
      .in("id", toDeactivate);
    console.log(`\n⚠️ ${toDeactivate.length}건 비활성화 (FSS에서 삭제됨)`);
  }

  // 6. 로그 기록
  await supabase.from("insurance_update_logs").insert({
    updated_by: "crawl-fss",
    change_type: "update",
    note: `FSS 동기화: ${upserted}건 upsert (신규 ${created}건), 옵션 ${insertedOptions}건, 비활성화 ${toDeactivate.length}건`,
  });

  console.log("\n🎉 동기화 완료!");
}

main().catch((e) => {
  console.error("크롤링 실패:", e);
  process.exit(1);
});
