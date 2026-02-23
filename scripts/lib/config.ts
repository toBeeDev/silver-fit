import path from "node:path";

export interface CrawlTarget {
  id: string;
  label: string;
}

export interface CrawlConfig {
  apiKey: string;
  fetchDelayMs: number;
  apiDelayMs: number;
  maxRetries: number;
  benefitsJsonPath: string;
  dryRun: boolean;
  model: string;
}

export const BOKJIRO_DETAIL_URL =
  "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do";

/** 크롤링 대상 노인 복지 서비스 ID 목록 (복지로 실제 검증 완료) */
export const CRAWL_TARGETS: CrawlTarget[] = [
  // 생활지원
  { id: "WLF00001164", label: "기초연금" },
  { id: "WLF00001196", label: "저소득층 건강보험료 및 노인장기요양보험료 지원" },
  // 의료건강
  { id: "WLF00001169", label: "의료급여 틀니·치과임플란트" },
  { id: "WLF00001115", label: "노인 안검진 및 개안수술" },
  { id: "WLF00001179", label: "노인 무릎인공관절 수술 지원" },
  { id: "WLF00004553", label: "저소득 어르신 무료틀니 지원사업" },
  // 일자리
  { id: "WLF00001155", label: "노인일자리 및 사회활동 지원사업" },
  { id: "WLF00004660", label: "고령자 고용지원금" },
  // 돌봄서비스
  { id: "WLF00001170", label: "장기요양급여이용지원" },
  { id: "WLF00001177", label: "장기요양 본인부담금 감경" },
  { id: "WLF00001249", label: "거동불편 저소득 재가노인 식사배달" },
  // 주거지원
  { id: "WLF00001108", label: "주택담보노후연금보증" },
  // 문화여가
  { id: "WLF00001111", label: "취약지역 어르신 문화누림" },
  // 생활지원(급식)
  { id: "WLF00004588", label: "저소득 어르신 무료급식사업" },
];

export function loadConfig(): CrawlConfig {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY 환경변수가 필요합니다.\n" +
        ".env.local에 설정하거나 export ANTHROPIC_API_KEY=sk-ant-... 실행하세요."
    );
  }

  return {
    apiKey,
    fetchDelayMs: parseInt(process.env.CRAWL_FETCH_DELAY ?? "2000", 10),
    apiDelayMs: parseInt(process.env.CRAWL_API_DELAY ?? "1000", 10),
    maxRetries: parseInt(process.env.CRAWL_MAX_RETRIES ?? "2", 10),
    benefitsJsonPath: path.resolve(
      process.cwd(),
      "src/data/benefits.json"
    ),
    dryRun: process.argv.includes("--dry-run"),
    model: process.env.CRAWL_MODEL ?? "claude-haiku-4-5-20251001",
  };
}
