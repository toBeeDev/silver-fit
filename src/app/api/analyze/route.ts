import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SYSTEM_PROMPT = `당신은 건강검진 결과를 쉽게 설명해주는 도우미입니다.
어르신과 일반인이 이해할 수 있도록 쉬운 말로 설명해주세요.

규칙:
1. 진단 행위 절대 금지 — "~입니다" 대신 "~일 수 있어요", "의사 선생님께 확인하세요" 사용
2. 각 수치마다: 정상 범위 → 현재 수치 → 쉬운 설명 순으로
3. 전체 요약은 마지막에 2~3줄로
4. 높은/낮은 수치는 ⚠️ 표시
5. 정상 수치는 ✅ 표시
6. 반드시 마지막에 "이 결과는 참고용이며 정확한 진단은 의사 선생님께 받으세요" 면책 문구 포함
7. 한국어로 답변

응답 형식:
## 📊 검진 결과 분석

### [항목명]
- 정상 범위: ...
- 내 수치: ... [✅ 정상 / ⚠️ 주의]
- 설명: 쉬운 말로 설명

(항목별 반복)

## 📝 전체 요약
...

⚕️ 면책 문구`;

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

    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
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
        lastError = e;
        const isOverloaded =
          e instanceof Anthropic.APIError && e.status === 529;
        if (!isOverloaded || attempt === MAX_RETRIES - 1) break;
        // 재시도 전 대기 (2초, 4초)
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }

    const message =
      lastError instanceof Anthropic.APIError && lastError.status === 529
        ? "서버가 일시적으로 혼잡합니다. 잠시 후 다시 시도해주세요."
        : lastError instanceof Error
          ? lastError.message
          : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 503 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
