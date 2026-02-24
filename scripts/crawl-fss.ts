/**
 * 금감원 금융상품한눈에 API에서 연금저축보험 데이터를 가져와 JSON으로 저장
 * 모든 페이지를 순회하며 전체 상품 데이터를 수집
 *
 * Usage: npx tsx scripts/crawl-fss.ts
 */

import fs from "fs";
import path from "path";

const FSS_API_BASE = "http://finlife.fss.or.kr/finlifeapi";
const API_KEY = process.env.FSS_API_KEY;
const OUTPUT_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "fss-annuity-products.json",
);

// 금융권역 코드
const FIN_GROUPS = [
  { code: "050000", name: "생명보험" },
  { code: "060000", name: "손해보험" },
];

interface FssResult {
  err_cd: string;
  err_msg: string;
  total_count: string;
  max_page_no: string;
  now_page_no: string;
  baseList: Record<string, unknown>[];
  optionList: Record<string, unknown>[];
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

  const allBase: Record<string, unknown>[] = [];
  const allOptions: Record<string, unknown>[] = [];

  // 첫 페이지로 총 페이지 수 파악
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

  // 나머지 페이지 순회
  for (let page = 2; page <= maxPage; page++) {
    console.log(`  페이지 ${page}/${maxPage} 조회 중...`);
    const result = await fetchPage(groupCode, page);
    if (result) {
      allBase.push(...result.baseList);
      allOptions.push(...result.optionList);
    }
    // API 부하 방지 딜레이
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `  완료: 기본정보 ${allBase.length}건, 옵션 ${allOptions.length}건`,
  );
  return { baseList: allBase, optionList: allOptions };
}

async function main() {
  if (!API_KEY) {
    console.error("FSS_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  console.log("=== 금감원 연금저축보험 데이터 수집 시작 ===");
  console.log(`시간: ${new Date().toISOString()}`);

  const allBase: Record<string, unknown>[] = [];
  const allOptions: Record<string, unknown>[] = [];

  for (const group of FIN_GROUPS) {
    const result = await crawlGroup(group.code, group.name);
    allBase.push(...result.baseList);
    allOptions.push(...result.optionList);
  }

  const output = {
    updatedAt: new Date().toISOString(),
    totalProducts: allBase.length,
    baseList: allBase,
    optionList: allOptions,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n=== 완료: ${allBase.length}건 저장 → ${OUTPUT_PATH} ===`);
}

main().catch((e) => {
  console.error("크롤링 실패:", e);
  process.exit(1);
});
