"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trophy } from "lucide-react";
import type { InsuranceProductDetail } from "@/types/insurance";
import { cn } from "@/lib/utils";
import { getCompanyUrl } from "@/lib/company-urls";

interface CompareRow {
  label: string;
  key: string;
  format: (p: InsuranceProductDetail) => string;
  rawValue?: (p: InsuranceProductDetail) => number | null;
  higherIsBetter?: boolean;
}

const PENSION_ROWS: CompareRow[] = [
  {
    label: "평균수익률",
    key: "avgPrftRate",
    format: (p) => p.avgPrftRate != null ? `${p.avgPrftRate}%` : "-",
    rawValue: (p) => p.avgPrftRate,
    higherIsBetter: true,
  },
  {
    label: "공시이율",
    key: "dclsRate",
    format: (p) => p.dclsRate != null ? `${p.dclsRate}%` : "-",
    rawValue: (p) => p.dclsRate,
    higherIsBetter: true,
  },
  {
    label: "최근 1년 수익률",
    key: "btrmPrftRate1",
    format: (p) => p.btrmPrftRate1 != null ? `${p.btrmPrftRate1}%` : "-",
    rawValue: (p) => p.btrmPrftRate1,
    higherIsBetter: true,
  },
  {
    label: "최근 2년 수익률",
    key: "btrmPrftRate2",
    format: (p) => p.btrmPrftRate2 != null ? `${p.btrmPrftRate2}%` : "-",
    rawValue: (p) => p.btrmPrftRate2,
    higherIsBetter: true,
  },
  {
    label: "최근 3년 수익률",
    key: "btrmPrftRate3",
    format: (p) => p.btrmPrftRate3 != null ? `${p.btrmPrftRate3}%` : "-",
    rawValue: (p) => p.btrmPrftRate3,
    higherIsBetter: true,
  },
  {
    label: "최저보증이율",
    key: "guarRate",
    format: (p) => p.guarRate || "-",
  },
  {
    label: "유지건수",
    key: "mntnCnt",
    format: (p) => p.mntnCnt ? `${p.mntnCnt.toLocaleString()}건` : "-",
    rawValue: (p) => p.mntnCnt ?? null,
    higherIsBetter: true,
  },
  {
    label: "가입방법",
    key: "joinWay",
    format: (p) => p.joinWay || "-",
  },
  {
    label: "판매개시일",
    key: "saleStartDay",
    format: (p) => p.saleStartDay || "-",
  },
];

const GENERAL_ROWS: CompareRow[] = [
  {
    label: "65세 남성 월보험료",
    key: "premium65m",
    format: (p) => p.premium65m != null ? `${p.premium65m.toLocaleString()}원` : "-",
    rawValue: (p) => p.premium65m,
    higherIsBetter: false,
  },
  {
    label: "65세 여성 월보험료",
    key: "premium65f",
    format: (p) => p.premium65f != null ? `${p.premium65f.toLocaleString()}원` : "-",
    rawValue: (p) => p.premium65f,
    higherIsBetter: false,
  },
  {
    label: "갱신 유형",
    key: "contractType",
    format: (p) => p.contractType === "renewal" ? "갱신형" : p.contractType === "non_renewal" ? "비갱신형" : "-",
  },
  {
    label: "가입연령",
    key: "age",
    format: (p) => `만 ${p.minAge}~${p.maxAge}세`,
  },
  {
    label: "가입 조건",
    key: "conditions",
    format: (p) => p.conditions || "-",
  },
];

function getBestIndex(products: InsuranceProductDetail[], rawValue: (p: InsuranceProductDetail) => number | null, higherIsBetter: boolean): number | null {
  let bestIdx: number | null = null;
  let bestVal: number | null = null;

  products.forEach((p, i) => {
    const v = rawValue(p);
    if (v == null) return;
    if (bestVal == null || (higherIsBetter ? v > bestVal : v < bestVal)) {
      bestVal = v;
      bestIdx = i;
    }
  });

  // 동점이면 하이라이트 안 함
  const allSame = products.every((p) => {
    const v = rawValue(p);
    return v == null || v === bestVal;
  });
  return allSame ? null : bestIdx;
}

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").filter(Boolean).slice(0, 3);

  const [products, setProducts] = useState<InsuranceProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    fetch("/api/insurance/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: ids }),
    })
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [idsParam]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-700 border-t-transparent" />
      </div>
    );
  }

  if (products.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-(--space-page-x) py-(--space-page-y) text-center">
        <p className="text-(--text-section-title) font-medium text-foreground">
          비교할 상품을 2개 이상 선택해주세요
        </p>
        <Link
          href="/insurance"
          className="mt-6 inline-flex items-center gap-1.5 text-(--text-body) text-primary-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const isPension = products[0].category === "연금저축보험";
  const rows = isPension ? PENSION_ROWS : GENERAL_ROWS;
  const colCount = products.length;

  return (
    <div className="mx-auto max-w-5xl px-(--space-page-x) py-(--space-page-y)">
      {/* 헤더 */}
      <Link
        href="/insurance"
        className="inline-flex items-center gap-1.5 text-(--text-body) text-sub-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        보험상품 목록
      </Link>

      <h1 className="mt-4 text-(--text-page-title) font-bold text-foreground">
        보험상품 비교
      </h1>
      <p className="mt-2 text-(--text-body) text-sub-text">
        선택한 {colCount}개 상품을 나란히 비교합니다
      </p>

      {/* 상품 헤더 카드 */}
      <div className={cn(
        "mt-(--space-section-gap) grid gap-3",
        colCount === 2 ? "grid-cols-2" : "grid-cols-3",
      )}>
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-white p-(--space-card-pad) text-center">
            {p.finCoNo ? (
              <Image
                src={`/images/company/${p.finCoNo}.png`}
                alt={p.companyName}
                width={64}
                height={64}
                className="mx-auto h-12 w-12 rounded-full sm:h-16 sm:w-16"
              />
            ) : (
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-(--text-body-sm) font-bold text-sub-text sm:h-16 sm:w-16">
                {p.companyName.slice(0, 2)}
              </div>
            )}
            <p className="mt-2 text-(--text-body-sm) font-medium text-primary-700">
              {p.companyName}
            </p>
            <p className="mt-0.5 line-clamp-2 text-(--text-card-title) font-semibold leading-snug text-foreground">
              {p.productName}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-(--text-caption) font-medium text-teal-700">
                {p.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 비교 테이블 */}
      <div className="mt-(--space-section-gap) overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-3 py-3 text-left text-(--text-body-sm) font-semibold text-foreground sm:px-5">
                비교 항목
              </th>
              {products.map((p) => (
                <th key={p.id} className="px-3 py-3 text-center text-(--text-body-sm) font-semibold text-foreground sm:px-5">
                  {p.companyName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const bestIdx = row.rawValue && row.higherIsBetter !== undefined
                ? getBestIndex(products, row.rawValue, row.higherIsBetter)
                : null;

              return (
                <tr key={row.key} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 text-(--text-body-sm) font-medium text-sub-text sm:px-5">
                    {row.label}
                  </td>
                  {products.map((p, i) => (
                    <td
                      key={p.id}
                      className={cn(
                        "px-3 py-3 text-center text-(--text-body) tabular-nums sm:px-5",
                        bestIdx === i
                          ? "font-bold text-primary-700"
                          : "text-foreground",
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {bestIdx === i && (
                          <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {row.format(p)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className={cn(
        "mt-(--space-section-gap) grid gap-3",
        colCount === 2 ? "grid-cols-2" : "grid-cols-3",
      )}>
        {products.map((p) => (
          <a
            key={p.id}
            href={p.finCoNo ? getCompanyUrl(p.finCoNo) : p.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-(--min-tap) items-center justify-center gap-1.5 rounded-xl bg-primary-700 px-4 text-(--text-btn) font-medium text-white transition-colors hover:bg-primary-800"
          >
            {p.companyName}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>

      {/* 면책 */}
      <p className="mt-6 text-center text-(--text-caption) text-sub-text">
        * 금감원 금융상품한눈에 공시 데이터 기준. 실제 수치는 다를 수 있습니다. 정확한 정보는 각 보험사에 문의하세요.
      </p>

      <div className="mt-8 text-center">
        <Link
          href="/insurance"
          className="inline-flex min-h-(--min-tap) items-center gap-1.5 rounded-xl border border-border px-6 text-(--text-btn) font-medium text-foreground transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
