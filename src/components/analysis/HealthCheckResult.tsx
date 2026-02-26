"use client";

import {
  CircleCheckBig,
  AlertTriangle,
  CircleAlert,
  Ruler,
  HeartPulse,
  Droplets,
  FlaskConical,
  Stethoscope,
  Activity,
  FileText,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────── */

export interface HealthCheckItem {
  name: string;
  status: "normal" | "caution" | "warning";
  normalRange?: string;
  value?: string;
  description?: string;
}

export interface HealthCheckSection {
  title: string;
  items: HealthCheckItem[];
}

export interface HealthCheckData {
  overall: {
    grade: string;
    description: string;
  };
  sections: HealthCheckSection[];
  summary: string;
  disclaimer: string;
}

/* ─── Status config ─────────────────────────────────── */

const STATUS = {
  normal: {
    icon: CircleCheckBig,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  caution: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  warning: {
    icon: CircleAlert,
    color: "text-red-600",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    border: "border-red-200",
    dot: "bg-red-500",
  },
} as const;

/* ─── Helpers ───────────────────────────────────────── */

function getSectionIcon(title: string): LucideIcon {
  if (/신체|체중|BMI|계측|허리|키/.test(title)) return Ruler;
  if (/혈압/.test(title)) return HeartPulse;
  if (/혈액|혈당|빈혈|콜레스테롤|혈색소/.test(title)) return Droplets;
  if (/간/.test(title)) return FlaskConical;
  if (/신장|콩팥|사구체|크레아티닌/.test(title)) return Activity;
  if (/기타|시력|청력|소변|흉부|우울|X-ray|엑스레이/.test(title))
    return Stethoscope;
  return Activity;
}

function getSectionStatus(
  items: HealthCheckItem[],
): "normal" | "caution" | "warning" {
  if (items.some((i) => i.status === "warning")) return "warning";
  if (items.some((i) => i.status === "caution")) return "caution";
  return "normal";
}

function getOverallStatus(grade: string): "normal" | "caution" | "warning" {
  const g = grade.toLowerCase();
  if (/이상|위험|질환|유소견/.test(g)) return "warning";
  if (/경계|주의|정상b|정상 b/.test(g)) return "caution";
  return "normal";
}

const SECTION_STATUS_LABEL = {
  normal: "정상",
  caution: "일부 주의",
  warning: "주의 필요",
} as const;

/* ─── Parser ────────────────────────────────────────── */

export function parseHealthCheckResult(
  text: string,
): HealthCheckData | null {
  try {
    let jsonStr = text.trim();

    // Handle markdown code block wrapping (```json ... ```)
    const codeBlockMatch = jsonStr.match(
      /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/,
    );
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    // Try to find outermost JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[0]);

    // Validate basic structure
    if (!data.overall || !Array.isArray(data.sections)) return null;

    return data as HealthCheckData;
  } catch {
    return null;
  }
}

/* ─── Components ────────────────────────────────────── */

interface HealthCheckResultProps {
  data: HealthCheckData;
}

export default function HealthCheckResult({ data }: HealthCheckResultProps) {
  const overallStatus = getOverallStatus(data.overall.grade);
  const overallCfg = STATUS[overallStatus];

  const allItems = data.sections.flatMap((s) => s.items);
  const normalCount = allItems.filter((i) => i.status === "normal").length;
  const cautionCount = allItems.filter((i) => i.status === "caution").length;
  const warningCount = allItems.filter((i) => i.status === "warning").length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Overall Grade Card ── */}
      <div
        className={cn(
          "rounded-2xl border p-5 sm:p-6",
          overallCfg.border,
          overallCfg.bg,
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16",
              overallCfg.iconBg,
            )}
          >
            <overallCfg.icon
              className={cn("h-7 w-7 sm:h-8 sm:w-8", overallCfg.color)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-medium text-sub-text">종합 판정</p>
            <p
              className={cn(
                "mt-0.5 text-section-title font-bold sm:text-page-title",
                overallCfg.color,
              )}
            >
              {data.overall.grade}
            </p>
            <p className="mt-1 text-body-sm leading-relaxed text-sub-text sm:text-body">
              {data.overall.description}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex gap-2 border-t border-current/10 pt-4 sm:gap-3">
          <StatBadge label="정상" count={normalCount} status="normal" />
          <StatBadge label="주의" count={cautionCount} status="caution" />
          <StatBadge label="이상" count={warningCount} status="warning" />
        </div>
      </div>

      {/* ── Sections ── */}
      {data.sections.map((section, si) => {
        const sectionStatus = getSectionStatus(section.items);
        const sectionCfg = STATUS[sectionStatus];
        const Icon = getSectionIcon(section.title);

        return (
          <div key={si} className="rounded-2xl border border-border bg-white">
            {/* Section header */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10",
                  sectionCfg.bg,
                )}
              >
                <Icon
                  className={cn("h-4 w-4 sm:h-5 sm:w-5", sectionCfg.color)}
                />
              </div>
              <h3 className="flex-1 text-body font-semibold text-foreground sm:text-card-title">
                {section.title}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-caption font-medium",
                  sectionCfg.bg,
                  sectionCfg.color,
                )}
              >
                {SECTION_STATUS_LABEL[sectionStatus]}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-border/40">
              {section.items.map((item, ii) => (
                <ItemRow key={ii} item={item} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Summary ── */}
      {data.summary && (
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary-700" />
            <h3 className="text-body font-semibold text-foreground sm:text-card-title">
              전체 요약
            </h3>
          </div>
          <p className="mt-3 text-body leading-relaxed text-sub-text">
            {data.summary}
          </p>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="rounded-xl bg-primary-50 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
          <p className="text-caption leading-relaxed text-sub-text sm:text-body-sm">
            {data.disclaimer ||
              "이 결과는 참고용이며 정확한 진단과 치료는 의사 선생님께 받으세요."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────── */

function ItemRow({ item }: { item: HealthCheckItem }) {
  const cfg = STATUS[item.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className={cn("mt-[7px] h-2 w-2 shrink-0 rounded-full", cfg.dot)} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-body font-semibold text-foreground">
              {item.name}
            </span>
            {item.value && (
              <span
                className={cn(
                  "text-body-sm font-bold tabular-nums",
                  cfg.color,
                )}
              >
                {item.value}
              </span>
            )}
          </div>
          {item.normalRange && (
            <p className="mt-0.5 text-caption text-sub-text sm:text-body-sm">
              정상 범위: {item.normalRange}
            </p>
          )}
          {item.description && (
            <p className="mt-1 text-body-sm leading-relaxed text-sub-text">
              {item.description}
            </p>
          )}
        </div>

        {/* Status icon */}
        <StatusIcon
          className={cn("mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5", cfg.color)}
        />
      </div>
    </div>
  );
}

function StatBadge({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: "normal" | "caution" | "warning";
}) {
  const cfg = STATUS[status];
  const active = count > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
        active ? "bg-white/60" : "bg-white/30",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active ? cfg.dot : "bg-gray-300",
        )}
      />
      <span className="text-caption font-medium text-sub-text">{label}</span>
      <span
        className={cn(
          "text-caption font-bold",
          active ? cfg.color : "text-gray-300",
        )}
      >
        {count}
      </span>
    </div>
  );
}
