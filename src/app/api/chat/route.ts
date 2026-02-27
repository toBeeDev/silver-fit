import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import type { InsuranceProductRow } from "@/types/supabase";

export const maxDuration = 60;

type ProductSummary = Pick<
  InsuranceProductRow,
  | "product_name"
  | "company"
  | "insurance_type"
  | "premium_65m"
  | "premium_65f"
  | "avg_prft_rate"
  | "dcls_rate"
  | "contract_type"
>;

async function getInsuranceContext(): Promise<string> {
  try {
    const { data } = await supabase
      .from("insurance_products")
      .select(
        "product_name, company, insurance_type, premium_65m, premium_65f, avg_prft_rate, dcls_rate, contract_type",
      )
      .eq("is_active", true)
      .limit(50);

    if (!data || data.length === 0) return "";

    const rows = data as unknown as ProductSummary[];

    const typeLabel: Record<string, string> = {
      pension: "연금저축보험",
      care: "간병보험",
      dementia: "치매보험",
      medical: "실손보험",
    };

    const grouped: Record<string, string[]> = {};
    for (const row of rows) {
      const cat = typeLabel[row.insurance_type] ?? row.insurance_type;
      if (!grouped[cat]) grouped[cat] = [];
      const parts = [`${row.company} - ${row.product_name}`];
      if (row.premium_65m != null)
        parts.push(`65세 남 월 ${row.premium_65m.toLocaleString()}원`);
      if (row.premium_65f != null)
        parts.push(`65세 여 월 ${row.premium_65f.toLocaleString()}원`);
      if (row.avg_prft_rate != null)
        parts.push(`평균수익률 ${row.avg_prft_rate}%`);
      if (row.dcls_rate != null)
        parts.push(`공시이율 ${row.dcls_rate}%`);
      if (row.contract_type)
        parts.push(row.contract_type === "renewal" ? "갱신형" : "비갱신형");
      grouped[cat].push(parts.join(" / "));
    }

    return Object.entries(grouped)
      .map(([cat, items]) => `[${cat}]\n${items.join("\n")}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

const BASE_SYSTEM_PROMPT = `당신은 SilverFit의 AI 복지·보험 상담사입니다.
부모님(65세 이상)을 위한 복지혜택과 보험 상품에 대해 친절하고 쉽게 안내합니다.

## 커버 영역
- 복지혜택 찾기 (기초연금, 장기요양보험, 의료비 지원 등)
- 보험 상품 추천·비교 (간병보험, 치매보험, 실손보험, 연금보험)
- 신청 방법·절차 안내
- 사용자 상황에 맞는 맞춤 분석

## 복지혜택 데이터 (2026년 기준)
[기초연금]
- 대상: 만 65세 이상, 소득 하위 70%
- 금액: 단독 최대 334,810원/월, 부부 최대 535,680원/월
- 신청: 주민센터 또는 복지로(bokjiro.go.kr)

[노인장기요양보험]
- 등급: 1~5등급, 인지지원등급
- 혜택: 방문요양/목욕, 주야간보호, 시설급여
- 본인부담: 재가 15%, 시설 20%
- 신청: 국민건강보험공단

[의료비 지원]
- 틀니/임플란트: 본인부담 30% (임플란트 평생 2개)
- 안검진: 만 66세 무료
- 보청기: 최대 131만원 지원

## 응답 원칙
1. 쉽고 친근한 말투 (전문용어 최소화)
2. 구체적 금액·조건 포함
3. 신청 방법까지 안내
4. 핵심만 간결하게
5. 보험 추천 시 "이 상품이 무조건 좋다"가 아닌 비교 정보 제공
6. 보험은 개인 상황에 따라 다르므로, 반드시 전문 상담을 권유`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버 설정 오류: API 키가 없습니다." },
      { status: 500 },
    );
  }

  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "메시지가 없습니다." },
        { status: 400 },
      );
    }

    const insuranceCtx = await getInsuranceContext();
    const systemPrompt = insuranceCtx
      ? `${BASE_SYSTEM_PROMPT}\n\n## 현재 보험 상품 데이터 (DB 실시간)\n${insuranceCtx}`
      : BASE_SYSTEM_PROMPT;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const content =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const statusMap: Record<number, string> = {
        401: "API 인증 오류",
        429: "요청 한도 초과: 잠시 후 다시 시도해주세요.",
        529: "서버가 혼잡합니다. 잠시 후 다시 시도해주세요.",
      };
      const message = statusMap[err.status] ?? `AI 응답 오류 (${err.status})`;
      return NextResponse.json({ error: message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "AI 응답 오류" }, { status: 500 });
  }
}
