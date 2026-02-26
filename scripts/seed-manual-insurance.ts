/**
 * 간병보험 / 치매보험 / 실손보험 수동 데이터 시드
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-manual-insurance.ts
 *
 * 데이터 출처: 금감원 보험비교공시, 보험다모아, 각 보험사 홈페이지 (2025~2026)
 * ⚠️ 보험료는 65세 기준 참고용이며 실제 가입 조건에 따라 달라질 수 있습니다.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://bklmtyecrxcdtdptrkzn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─── 간병보험 (Care) ─────────────────────────────────────────

const CARE_PRODUCTS = [
  {
    company: "동양생명",
    product_name: "간편간병보험",
    contract_type: "non_renewal",
    premium_65m: 41200,
    premium_65f: 38500,
    payment_period: "10년납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,000만원",
      sub2: "재가간병 지원금 월 30만원",
    },
    conditions: "간편심사(3가지 고지), 1년 면책기간",
    source_url: "https://www.myangel.co.kr",
  },
  {
    company: "흥국생명",
    product_name: "시니어간병보험",
    contract_type: "non_renewal",
    premium_65m: 45000,
    premium_65f: 42300,
    payment_period: "10년납",
    min_age: 50,
    max_age: 80,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,000만원",
      sub2: "장기요양 3등급 진단 시 500만원",
    },
    conditions: "유병자 가입 가능, 2년 감액기간",
    source_url: "https://www.heungkuklife.co.kr",
  },
  {
    company: "KB손해보험",
    product_name: "골든라이프케어 간병보험",
    contract_type: "renewal",
    premium_65m: 46700,
    premium_65f: 43900,
    payment_period: "전기납",
    min_age: 20,
    max_age: 75,
    coverage: {
      main: "간병인 사용 일당 15만원 (최대 120일)",
      sub1: "장기요양 1~2등급 진단 시 2,000만원",
      sub2: "요양병원 입원 일당 5만원",
    },
    conditions: "3년 갱신, 표준체 가입",
    source_url: "https://www.kbinsure.co.kr",
  },
  {
    company: "현대해상",
    product_name: "마음을 더하는 케어간병인보험",
    contract_type: "non_renewal",
    premium_65m: 43000,
    premium_65f: 40200,
    payment_period: "10년납",
    min_age: 20,
    max_age: 70,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,500만원",
      sub2: "간병인 방문서비스 월 2회",
    },
    conditions: "비갱신형, 90일 면책기간",
    source_url: "https://www.hi.co.kr",
  },
  {
    company: "한화생명",
    product_name: "밸류플러스 간병보험",
    contract_type: "non_renewal",
    premium_65m: 44000,
    premium_65f: 41500,
    payment_period: "10년납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,000만원",
      sub2: "재가간병 서비스 월 20만원",
    },
    conditions: "비갱신형, 고혈압·당뇨 가입 가능",
    source_url: "https://www.hanwhalife.com",
  },
  {
    company: "DB손해보험",
    product_name: "참좋은 간병보험",
    contract_type: "renewal",
    premium_65m: 42000,
    premium_65f: 39500,
    payment_period: "전기납",
    min_age: 20,
    max_age: 80,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~4등급 진단 시 500만원~2,000만원",
      sub2: "치매안심 진단비 500만원",
    },
    conditions: "1년 갱신, 간편심사 가능",
    source_url: "https://www.directdb.co.kr",
  },
  {
    company: "삼성화재",
    product_name: "간병인지원 특약보험",
    contract_type: "non_renewal",
    premium_65m: 47000,
    premium_65f: 44200,
    payment_period: "15년납",
    min_age: 20,
    max_age: 65,
    coverage: {
      main: "간병인 사용 일당 15만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 2,000만원",
      sub2: "간병 관련 수술비 300만원",
    },
    conditions: "비갱신형, 표준체 심사",
    source_url: "https://www.samsungfire.com",
  },
  {
    company: "메리츠화재",
    product_name: "시니어간병보험",
    contract_type: "renewal",
    premium_65m: 45500,
    premium_65f: 42800,
    payment_period: "전기납",
    min_age: 30,
    max_age: 75,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,500만원",
      sub2: "요양시설 이용 지원금 월 50만원",
    },
    conditions: "3년 갱신, 유병자 가입 가능",
    source_url: "https://www.meritzfire.com",
  },
  {
    company: "교보생명",
    product_name: "무배당 교보간병보험",
    contract_type: "non_renewal",
    premium_65m: 43500,
    premium_65f: 40800,
    payment_period: "10년납",
    min_age: 20,
    max_age: 70,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,000만원",
      sub2: "재가간병 지원금 월 25만원",
    },
    conditions: "비갱신형, 90일 면책기간",
    source_url: "https://www.kyobo.co.kr",
  },
  {
    company: "신한라이프",
    product_name: "간병비보장보험",
    contract_type: "non_renewal",
    premium_65m: 41800,
    premium_65f: 39200,
    payment_period: "10년납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "간병인 사용 일당 10만원 (최대 180일)",
      sub1: "장기요양 1~2등급 진단 시 1,000만원",
      sub2: "간병생활 자금 월 30만원",
    },
    conditions: "비갱신형, 간편심사(5가지 고지)",
    source_url: "https://www.shinhanlife.co.kr",
  },
];

// ─── 치매보험 (Dementia) ─────────────────────────────────────

const DEMENTIA_PRODUCTS = [
  {
    company: "삼성생명",
    product_name: "매간병보험 프리미엄(치매보장)",
    contract_type: "non_renewal",
    premium_65m: 74000,
    premium_65f: 81000,
    payment_period: "10년납",
    min_age: 15,
    max_age: 70,
    coverage: {
      main: "중증치매 진단 시 3,000만원",
      sub1: "경증치매 진단 시 500만원",
      sub2: "치매간병인 사용 일당 10만원",
      sub3: "치매 치료 입원 일당 5만원",
    },
    conditions: "비갱신형, 2년 감액기간, CDR 3이상 중증",
    source_url: "https://www.samsunglife.com",
  },
  {
    company: "한화생명",
    product_name: "치매케어보험",
    contract_type: "non_renewal",
    premium_65m: 44300,
    premium_65f: 48700,
    payment_period: "10년납",
    min_age: 20,
    max_age: 75,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 300만원",
      sub2: "치매간병 자금 월 30만원",
    },
    conditions: "비갱신형, 90일 면책기간, CDR 3이상",
    source_url: "https://www.hanwhalife.com",
  },
  {
    company: "교보생명",
    product_name: "무배당 치매간병보험",
    contract_type: "non_renewal",
    premium_65m: 52000,
    premium_65f: 57200,
    payment_period: "10년납",
    min_age: 20,
    max_age: 70,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 500만원",
      sub2: "치매간병인 일당 10만원 (180일)",
      sub3: "MCI(경도인지장애) 진단 시 100만원",
    },
    conditions: "비갱신형, 1년 면책기간",
    source_url: "https://www.kyobo.co.kr",
  },
  {
    company: "동양생명",
    product_name: "수호천사 치매보험",
    contract_type: "non_renewal",
    premium_65m: 48000,
    premium_65f: 52800,
    payment_period: "10년납",
    min_age: 15,
    max_age: 80,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 300만원",
      sub2: "치매간병 생활자금 월 20만원",
    },
    conditions: "간편심사, 유병자 가입 가능",
    source_url: "https://www.myangel.co.kr",
  },
  {
    company: "DB손해보험",
    product_name: "참좋은 치매보험",
    contract_type: "renewal",
    premium_65m: 51000,
    premium_65f: 56100,
    payment_period: "전기납",
    min_age: 20,
    max_age: 80,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 500만원",
      sub2: "치매간병인 일당 10만원 (최대 180일)",
      sub3: "장기요양 1~2등급 진단 시 1,000만원",
    },
    conditions: "3년 갱신, 90일 면책기간",
    source_url: "https://www.directdb.co.kr",
  },
  {
    company: "KB손해보험",
    product_name: "치매간병비보험",
    contract_type: "renewal",
    premium_65m: 49000,
    premium_65f: 53900,
    payment_period: "전기납",
    min_age: 20,
    max_age: 75,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 500만원",
      sub2: "치매간병 일당 10만원",
    },
    conditions: "1년 갱신, 표준체 심사",
    source_url: "https://www.kbinsure.co.kr",
  },
  {
    company: "현대해상",
    product_name: "치매보장보험",
    contract_type: "non_renewal",
    premium_65m: 53000,
    premium_65f: 58300,
    payment_period: "10년납",
    min_age: 20,
    max_age: 70,
    coverage: {
      main: "중증치매 진단 시 3,000만원",
      sub1: "경증치매 진단 시 500만원",
      sub2: "치매간병인 일당 15만원 (최대 120일)",
    },
    conditions: "비갱신형, CDR 3이상 중증치매",
    source_url: "https://www.hi.co.kr",
  },
  {
    company: "메리츠화재",
    product_name: "치매보장보험",
    contract_type: "renewal",
    premium_65m: 46000,
    premium_65f: 50600,
    payment_period: "전기납",
    min_age: 30,
    max_age: 80,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 300만원",
      sub2: "치매간병 일당 10만원 (180일)",
    },
    conditions: "3년 갱신, 유병자 가입 가능",
    source_url: "https://www.meritzfire.com",
  },
  {
    company: "신한라이프",
    product_name: "치매안심보험",
    contract_type: "non_renewal",
    premium_65m: 47500,
    premium_65f: 52300,
    payment_period: "10년납",
    min_age: 20,
    max_age: 75,
    coverage: {
      main: "중증치매 진단 시 2,000만원",
      sub1: "경증치매 진단 시 500만원",
      sub2: "치매생활 자금 월 30만원",
    },
    conditions: "비갱신형, 90일 면책기간",
    source_url: "https://www.shinhanlife.co.kr",
  },
  {
    company: "흥국생명",
    product_name: "시니어 치매보험",
    contract_type: "non_renewal",
    premium_65m: 50000,
    premium_65f: 55000,
    payment_period: "10년납",
    min_age: 50,
    max_age: 80,
    coverage: {
      main: "중증치매 진단 시 1,500만원",
      sub1: "경증치매 진단 시 300만원",
      sub2: "치매간병인 일당 10만원",
    },
    conditions: "유병자 가입 가능, 간편심사",
    source_url: "https://www.heungkuklife.co.kr",
  },
];

// ─── 실손보험 (Medical / 4세대 실손) ──────────────────────────

const MEDICAL_PRODUCTS = [
  {
    company: "삼성화재",
    product_name: "무배당 유병력자 실손의료보험",
    contract_type: "renewal",
    premium_65m: 28000,
    premium_65f: 31500,
    payment_period: "전기납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
      sub3: "비급여 특약 선택 가능",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.samsungfire.com",
  },
  {
    company: "현대해상",
    product_name: "무배당 유병력자 실손의료보험",
    contract_type: "renewal",
    premium_65m: 27000,
    premium_65f: 30400,
    payment_period: "전기납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.hi.co.kr",
  },
  {
    company: "DB손해보험",
    product_name: "참좋은 실손의료보험",
    contract_type: "renewal",
    premium_65m: 26500,
    premium_65f: 29800,
    payment_period: "전기납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.directdb.co.kr",
  },
  {
    company: "KB손해보험",
    product_name: "KB 실손의료보험",
    contract_type: "renewal",
    premium_65m: 29000,
    premium_65f: 32600,
    payment_period: "전기납",
    min_age: 15,
    max_age: 70,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
      sub3: "2·3세대 전환 특약 가능",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.kbinsure.co.kr",
  },
  {
    company: "메리츠화재",
    product_name: "메리츠 실손의료보험",
    contract_type: "renewal",
    premium_65m: 28500,
    premium_65f: 32000,
    payment_period: "전기납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.meritzfire.com",
  },
  {
    company: "한화손해보험",
    product_name: "한화 실손의료보험",
    contract_type: "renewal",
    premium_65m: 27500,
    premium_65f: 30900,
    payment_period: "전기납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.hwgeneralins.com",
  },
  {
    company: "롯데손해보험",
    product_name: "롯데 실손의료보험",
    contract_type: "renewal",
    premium_65m: 30000,
    premium_65f: 33700,
    payment_period: "전기납",
    min_age: 15,
    max_age: 70,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.lotteins.co.kr",
  },
  {
    company: "흥국화재",
    product_name: "흥국 실손의료보험",
    contract_type: "renewal",
    premium_65m: 31000,
    premium_65f: 34800,
    payment_period: "전기납",
    min_age: 20,
    max_age: 70,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.heungkukfire.co.kr",
  },
  {
    company: "MG손해보험",
    product_name: "MG 실손의료보험",
    contract_type: "renewal",
    premium_65m: 32000,
    premium_65f: 36000,
    payment_period: "전기납",
    min_age: 15,
    max_age: 70,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.mggeneralins.com",
  },
  {
    company: "농협손해보험",
    product_name: "NH 실손의료보험",
    contract_type: "renewal",
    premium_65m: 27800,
    premium_65f: 31200,
    payment_period: "전기납",
    min_age: 15,
    max_age: 75,
    coverage: {
      main: "입원의료비 5,000만원 (본인부담 20%)",
      sub1: "통원의료비 외래 20만원 (본인부담 3만원)",
      sub2: "통원의료비 처방조제 10만원 (본인부담 3만원)",
    },
    conditions: "1년 갱신, 15년 재가입, 급여 자기부담 20%",
    source_url: "https://www.nhfire.co.kr",
  },
];

// ─── 삽입 ─────────────────────────────────────────────────────

interface ProductInput {
  company: string;
  product_name: string;
  contract_type: string;
  premium_65m: number;
  premium_65f: number;
  payment_period: string;
  min_age: number;
  max_age: number;
  coverage: Record<string, string | undefined>;
  conditions: string;
  source_url: string;
}

async function insertProducts(
  type: "care" | "dementia" | "medical",
  products: ProductInput[],
  label: string,
) {
  console.log(`\n[${label}] ${products.length}건 삽입 시작...`);

  const rows = products.map((p) => ({
    source: "manual" as const,
    product_code: null,
    company: p.company,
    product_name: p.product_name,
    insurance_type: type,
    contract_type: p.contract_type,
    premium_65m: p.premium_65m,
    premium_65f: p.premium_65f,
    payment_period: p.payment_period,
    min_age: p.min_age,
    max_age: p.max_age,
    coverage: p.coverage,
    conditions: p.conditions,
    source_url: p.source_url,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from("insurance_products")
    .insert(rows)
    .select("id, company, product_name");

  if (error) {
    console.error(`❌ ${label} 삽입 실패:`, error.message);
    return 0;
  }

  console.log(`✅ ${label} ${(data ?? []).length}건 삽입 완료`);
  for (const row of data ?? []) {
    console.log(`   → ${row.company} | ${row.product_name} (${row.id})`);
  }
  return (data ?? []).length;
}

async function main() {
  console.log("=== 간병/치매/실손 보험 수동 데이터 시드 ===");
  console.log(`시간: ${new Date().toISOString()}`);

  // 기존 수동 데이터 확인
  const { count } = await supabase
    .from("insurance_products")
    .select("*", { count: "exact", head: true })
    .eq("source", "manual");

  if (count && count > 0) {
    console.log(`\n⚠️ 기존 수동 데이터 ${count}건이 있습니다.`);
    console.log("   중복 삽입 방지를 위해 기존 데이터를 먼저 비활성화합니다...");

    await supabase
      .from("insurance_products")
      .update({ is_active: false })
      .eq("source", "manual");

    console.log("   → 기존 수동 데이터 비활성화 완료");
  }

  let total = 0;
  total += await insertProducts("care", CARE_PRODUCTS, "간병보험");
  total += await insertProducts("dementia", DEMENTIA_PRODUCTS, "치매보험");
  total += await insertProducts("medical", MEDICAL_PRODUCTS, "실손보험");

  // 로그 기록
  await supabase.from("insurance_update_logs").insert({
    updated_by: "seed-manual",
    change_type: "add",
    note: `수동 데이터 시드: 간병 ${CARE_PRODUCTS.length}건, 치매 ${DEMENTIA_PRODUCTS.length}건, 실손 ${MEDICAL_PRODUCTS.length}건 (총 ${total}건)`,
  });

  console.log(`\n🎉 총 ${total}건 삽입 완료!`);
  console.log(`   간병보험: ${CARE_PRODUCTS.length}건`);
  console.log(`   치매보험: ${DEMENTIA_PRODUCTS.length}건`);
  console.log(`   실손보험: ${MEDICAL_PRODUCTS.length}건`);
}

main().catch((e) => {
  console.error("시드 실패:", e);
  process.exit(1);
});
