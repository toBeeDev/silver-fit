/**
 * FSS JSON 캐시 → Supabase 마이그레이션 스크립트
 *
 * 실행: SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://bklmtyecrxcdtdptrkzn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY 환경변수를 설정해주세요.");
  console.error(
    "   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/migrate-to-supabase.ts",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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

async function main() {
  console.log("📂 JSON 캐시 로딩...");
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "fss-annuity-products.json",
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as {
    baseList: FssBase[];
    optionList: FssOption[];
  };

  const bases = data.baseList.filter((b) => !!b.sale_strt_day);
  console.log(`✅ 유효 상품: ${bases.length}건, 옵션: ${data.optionList.length}건`);

  // 1. 상품 삽입
  console.log("\n📦 상품 데이터 삽입 중...");
  const productIdMap = new Map<string, string>(); // "fin_co_no|fin_prdt_cd" → uuid

  // 배치 처리 (50건씩)
  const BATCH_SIZE = 50;
  let insertedProducts = 0;

  for (let i = 0; i < bases.length; i += BATCH_SIZE) {
    const batch = bases.slice(i, i + BATCH_SIZE);
    const rows = batch.map((base) => ({
      source: "fss_api" as const,
      product_code: `${base.fin_co_no}-${base.fin_prdt_cd}`,
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
    }));

    const { data: inserted, error } = await supabase
      .from("insurance_products")
      .insert(rows)
      .select("id, product_code");

    if (error) {
      console.error(`❌ 상품 삽입 에러 (batch ${i / BATCH_SIZE + 1}):`, error.message);
      continue;
    }

    for (const row of inserted ?? []) {
      if (row.product_code) {
        productIdMap.set(row.product_code, row.id);
      }
    }
    insertedProducts += (inserted ?? []).length;
    process.stdout.write(`\r  ${insertedProducts}/${bases.length} 삽입 완료`);
  }
  console.log(`\n✅ 상품 ${insertedProducts}건 삽입 완료`);

  // 2. 옵션 삽입
  console.log("\n📦 옵션 데이터 삽입 중...");
  let insertedOptions = 0;
  let skippedOptions = 0;

  for (let i = 0; i < data.optionList.length; i += BATCH_SIZE) {
    const batch = data.optionList.slice(i, i + BATCH_SIZE);
    const rows: Array<Record<string, unknown>> = [];

    for (const opt of batch) {
      const key = `${opt.fin_co_no}-${opt.fin_prdt_cd}`;
      const productId = productIdMap.get(key);
      if (!productId) {
        skippedOptions++;
        continue;
      }
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
      console.error(`❌ 옵션 삽입 에러 (batch ${i / BATCH_SIZE + 1}):`, error.message);
      continue;
    }
    insertedOptions += rows.length;
    process.stdout.write(
      `\r  ${insertedOptions}/${data.optionList.length - skippedOptions} 삽입 완료`,
    );
  }

  console.log(`\n✅ 옵션 ${insertedOptions}건 삽입 완료 (스킵: ${skippedOptions}건)`);

  // 3. 로그 기록
  await supabase.from("insurance_update_logs").insert({
    updated_by: "migrate-script",
    change_type: "add",
    note: `FSS JSON → Supabase 초기 마이그레이션: 상품 ${insertedProducts}건, 옵션 ${insertedOptions}건`,
  });

  console.log("\n🎉 마이그레이션 완료!");
}

main().catch((err) => {
  console.error("❌ 마이그레이션 실패:", err);
  process.exit(1);
});
