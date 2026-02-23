import { z } from "zod/v4";
import type { Benefit } from "../../src/types/benefit.js";
import type { ClaudeExtractionResult } from "./structurer.js";

const BenefitSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(10),
  description: z.string().min(20),
  category: z.enum([
    "생활지원",
    "의료건강",
    "주거지원",
    "일자리",
    "문화여가",
    "돌봄서비스",
    "교통",
    "기타",
  ]),
  provider: z.string().min(1),
  ageRange: z.object({
    min: z.number().int().min(0).max(120),
    max: z.number().int().min(0).max(120).nullable(),
  }),
  incomeLevels: z
    .array(
      z.enum([
        "기초생활",
        "차상위",
        "중위50",
        "중위100",
        "중위150",
        "무관",
      ])
    )
    .min(1),
  regions: z.array(z.string().min(1)).min(1),
  amount: z.string().min(1),
  status: z.enum(["진행중", "예정", "마감"]),
  application: z.object({
    methods: z.array(z.string().min(1)),
    url: z.string().nullable(),
    phone: z.string().nullable(),
    documents: z.array(z.string()),
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  tags: z.array(z.string()).min(1),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ValidationResult =
  | { success: true; data: Benefit }
  | { success: false; errors: string[] };

/** Claude 출력을 Benefit 타입으로 검증 (자동 보정 포함) */
export function validateBenefit(
  raw: ClaudeExtractionResult
): ValidationResult {
  // 자동 보정
  const patched = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;

  const app = patched["application"] as
    | Record<string, unknown>
    | undefined;
  if (app) {
    if (app["url"] === "" || app["url"] === "없음") app["url"] = null;
    if (app["phone"] === "" || app["phone"] === "없음") app["phone"] = null;
    const methods = app["methods"] as string[] | undefined;
    if (!methods || methods.length === 0) app["methods"] = ["방문"];
  }

  if (patched["endDate"] === "" || patched["endDate"] === "없음") {
    patched["endDate"] = null;
  }

  const ageRange = patched["ageRange"] as
    | Record<string, unknown>
    | undefined;
  if (ageRange && ageRange["max"] === 0) {
    ageRange["max"] = null;
  }

  const result = BenefitSchema.safeParse(patched);

  if (result.success) {
    return { success: true, data: result.data as Benefit };
  }

  return {
    success: false,
    errors: z.prettifyError(result.error).split("\n"),
  };
}
