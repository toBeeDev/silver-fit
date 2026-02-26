import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SYSTEM_PROMPT = `당신은 건강검진 결과를 쉽게 설명해주는 도우미입니다.
어르신과 일반인이 이해할 수 있도록 쉬운 말로 설명해주세요.

규칙:
1. 진단 행위 절대 금지 — "~입니다" 대신 "~일 수 있어요", "의사 선생님께 확인하세요" 사용
2. 각 수치마다: 정상 범위 → 현재 수치 → 쉬운 설명 순으로
3. 높거나 낮은 수치는 status를 "caution" (약간 벗어남) 또는 "warning" (크게 벗어남)으로 표시
4. 정상 수치는 status를 "normal"로 표시
5. 관련된 항목끼리 섹션으로 묶어주세요 (예: 신체 계측, 혈압, 혈액검사, 간기능, 신장기능, 기타 검사)
6. 한국어로 답변

응답은 반드시 아래 JSON 형식으로만 출력하세요. JSON 외의 텍스트는 절대 포함하지 마세요.

{
  "overall": {
    "grade": "종합 판정 (예: 정상A, 정상B(경계), 주의, 이상 등)",
    "description": "종합 판정에 대한 간단한 한 줄 설명"
  },
  "sections": [
    {
      "title": "섹션명 (예: 신체 계측, 혈압, 혈액검사, 간기능, 신장기능, 기타 검사)",
      "items": [
        {
          "name": "검사 항목명 (예: 체질량지수(BMI))",
          "status": "normal 또는 caution 또는 warning",
          "normalRange": "정상 범위 텍스트 (예: 18.5~24.9 kg/m²)",
          "value": "측정값과 단위 (예: 22.7 kg/m²)",
          "description": "쉬운 말로 한 줄 설명"
        }
      ]
    }
  ],
  "summary": "전체 요약 2~3문장",
  "disclaimer": "이 결과는 참고용이며 정확한 진단과 치료는 의사 선생님께 받으세요."
}`;

export const maxDuration = 60; // Vercel 서버리스 함수 타임아웃 60초

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버 설정 오류: API 키가 없습니다." },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기가 10MB를 초과합니다." },
        { status: 400 },
      );
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: "이미지(JPG, PNG) 또는 PDF 파일만 지원합니다." },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const content: Anthropic.Messages.ContentBlockParam[] = isImage
      ? [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: file.type as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: base64,
            },
          },
          { type: "text", text: "이 건강검진 결과표를 분석해주세요." },
        ]
      : [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          { type: "text", text: "이 건강검진 결과표 PDF를 분석해주세요." },
        ];

    const client = new Anthropic({ apiKey });

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      const result =
        textBlock && textBlock.type === "text" ? textBlock.text : "";

      return NextResponse.json({ result });
    } catch (e) {
      if (e instanceof Anthropic.APIError) {
        const statusMap: Record<number, string> = {
          401: "API 인증 오류: 키가 유효하지 않습니다.",
          403: "API 권한 오류: 해당 모델에 접근할 수 없습니다.",
          429: "요청 한도 초과: 잠시 후 다시 시도해주세요.",
          529: "서버가 일시적으로 혼잡합니다. 잠시 후 다시 시도해주세요.",
        };
        const message = statusMap[e.status] ?? `API 오류 (${e.status}): ${e.message}`;
        return NextResponse.json({ error: message }, { status: e.status });
      }
      throw e;
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
