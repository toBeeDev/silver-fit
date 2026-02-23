import Anthropic from "@anthropic-ai/sdk";
import type { BokjiroRawData } from "./parser.js";

const SYSTEM_PROMPT = `당신은 한국 복지혜택 데이터 구조화 전문가입니다.
복지로 웹사이트에서 추출한 원시 텍스트를 분석하여 JSON 스키마에 맞게 구조화합니다.

규칙:
1. 유효한 JSON 객체만 출력. 설명/마크다운 없이 JSON만.
2. 원문에 없는 정보를 만들어내지 마세요. 확인 불가 시 기본값 사용.
3. 한글 데이터는 한글 그대로 유지.
4. 날짜 형식: "YYYY-MM-DD"`;

function buildUserPrompt(raw: BokjiroRawData): string {
  const today = new Date().toISOString().split("T")[0];

  return `아래 복지로 웹페이지에서 추출한 원시 데이터를 JSON으로 구조화하세요.

## 원시 데이터

- **복지ID:** ${raw.wlfareInfoId}
- **제목:** ${raw.wlfareInfoNm}
- **개요:** ${raw.wlfareInfoOutlCn}
- **지원대상:** ${raw.wlfareSprtTrgtCn}
- **선정기준:** ${raw.wlfareSprtTrgtSlcrCn}
- **지원내용:** ${raw.wlfareSprtBnftCn}
- **신청방법:** ${raw.aplyMtdDc}
- **신청방법(요약):** ${raw.aplyMtdDcdnm}
- **연령구분:** ${raw.wlfareInfoAggrpCdnm}
- **담당기관:** ${raw.bizChrInstNm}
- **담당부서:** ${raw.bizChrDeptNm}
- **대표연락처:** ${raw.rprsCtadr}
- **신청URL:** ${raw.mkclUrl}
- **지원유형:** ${raw.wlbzslTcdnm}
- **태그:** ${raw.tagNm}
- **최종수정:** ${raw.lastChgPtm}

## 출력 JSON 스키마

{
  "id": "영문 kebab-case 식별자 (예: basic-pension, elderly-job)",
  "slug": "한글 URL slug, 공백→하이픈 (예: 기초연금, 노인일자리-지원)",
  "title": "정식 혜택 명칭",
  "summary": "1~2문장 핵심 요약 (대상 + 혜택 금액/내용)",
  "description": "3~5문장 상세 설명",
  "category": "생활지원 | 의료건강 | 주거지원 | 일자리 | 문화여가 | 돌봄서비스 | 교통 | 기타 중 하나",
  "provider": "담당기관명",
  "ageRange": { "min": 0, "max": null },
  "incomeLevels": ["기초생활 | 차상위 | 중위50 | 중위100 | 중위150 | 무관 중 해당 항목"],
  "regions": ["전국 또는 특정 시도명"],
  "amount": "지원 금액 요약 (예: 월 최대 334,810원)",
  "status": "진행중 | 예정 | 마감 중 하나",
  "application": {
    "methods": ["온라인 | 방문 | 전화 | 우편 중 해당 항목"],
    "url": "신청 URL 또는 null",
    "phone": "전화번호 또는 null",
    "documents": ["필요 서류 목록"]
  },
  "startDate": "YYYY-MM-DD (상시이면 올해 1월 1일)",
  "endDate": "YYYY-MM-DD 또는 null (상시이면 null)",
  "tags": ["검색용 키워드 4~8개"],
  "updatedAt": "${today}"
}

JSON 객체 하나만 출력하세요.`;
}

export interface ClaudeExtractionResult {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  provider: string;
  ageRange: { min: number; max: number | null };
  incomeLevels: string[];
  regions: string[];
  amount: string;
  status: string;
  application: {
    methods: string[];
    url: string | null;
    phone: string | null;
    documents: string[];
  };
  startDate: string;
  endDate: string | null;
  tags: string[];
  updatedAt: string;
}

export async function structureWithClaude(
  raw: BokjiroRawData,
  config: { apiKey: string; model: string }
): Promise<ClaudeExtractionResult> {
  const client = new Anthropic({ apiKey: config.apiKey });

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(raw) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude 응답에 텍스트가 없습니다");
  }

  let jsonStr = textBlock.text.trim();

  // 마크다운 코드블록 래핑 제거
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }

  try {
    return JSON.parse(jsonStr) as ClaudeExtractionResult;
  } catch {
    throw new Error(
      `Claude 응답 JSON 파싱 실패 (${raw.wlfareInfoId}): ${jsonStr.substring(0, 200)}`
    );
  }
}
