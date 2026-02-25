import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getInsuranceProductById,
  getAllInsuranceProductIds,
} from "@/lib/insurance";
import dynamic from "next/dynamic";
import DetailFloatingNav from "@/components/insurance/DetailFloatingNav";
import ScrollToTop from "@/components/common/ScrollToTop";

const PensionSimulator = dynamic(
  () => import("@/components/insurance/PensionSimulator"),
);
import { getCompanyUrl } from "@/lib/company-urls";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAllInsuranceProductIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getInsuranceProductById(id);
  if (!product) return { title: "상품을 찾을 수 없습니다" };

  return {
    title: `${product.productName} - ${product.companyName}`,
    description: `${product.companyName}의 ${product.productName}. ${product.pnsnKindNm}, ${product.prdtTypeNm}. 공시이율 ${product.dclsRate}%, 평균수익률 ${product.avgPrftRate}%.`,
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return dateStr;
}

function RateCard({
  label,
  value,
  unit = "%",
  accent = false,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  accent?: boolean;
}) {
  const display = value != null && value !== "" ? `${value}${unit}` : "-";
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="text-[13px] font-medium text-sub-text">{label}</p>
      <p
        className={`mt-1 text-[24px] font-bold ${accent ? "text-primary-700" : "text-foreground"}`}
      >
        {display}
      </p>
    </div>
  );
}

export default async function InsuranceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = getInsuranceProductById(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <ScrollToTop />

      {/* 플로팅 네비게이션 */}
      <DetailFloatingNav />

      {/* 뒤로가기 */}
      <Link
        href="/insurance"
        className="inline-flex items-center gap-1.5 text-[14px] text-sub-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        보험상품 목록
      </Link>

      {/* 상단 헤더 */}
      <section id="product-info" className="scroll-mt-20">
        <div className="mt-6 flex items-start gap-5">
          <Image
            src={`/images/company/${product.finCoNo}.png`}
            alt={product.companyName}
            width={80}
            height={80}
            className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                {product.pnsnKindNm}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                {product.prdtTypeNm}
              </span>
              <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-sub-text">
                금감원 공시
              </span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-primary-700">
              {product.companyName}
            </p>
            <h1 className="mt-1 text-[26px] font-bold leading-tight text-foreground sm:text-[30px]">
              {product.productName}
            </h1>
          </div>
        </div>

        {/* 금리/수익률 카드 */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <RateCard label="공시이율" value={product.dclsRate} accent />
          <RateCard
            label="최저보증이율"
            value={product.guarRate ? "별도" : "-"}
            unit=""
          />
          <RateCard label="연평균수익률" value={product.avgPrftRate} />
        </div>

        {/* 최저보증이율 상세 */}
        {product.guarRate && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-[13px] font-semibold text-amber-800">
              최저보증이율 상세
            </p>
            <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-amber-700">
              {product.guarRate.replace(/\\r\\n|\\r|\\n/g, "\n").replace(/\r\n|\r/g, "\n")}
            </p>
          </div>
        )}
      </section>

      {/* 기간별 수익률 */}
      <section id="profit-rate" className="mt-8 scroll-mt-20">
        <h2 className="text-[19px] font-semibold text-foreground">
          기간별 수익률
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ProfitRateBar label="최근 1년" value={product.btrmPrftRate1} />
          <ProfitRateBar label="최근 2년" value={product.btrmPrftRate2} />
          <ProfitRateBar label="최근 3년" value={product.btrmPrftRate3} />
        </div>
      </section>

      {/* 연금 계산기 (아코디언) */}
      <section id="pension-calc" className="mt-10 scroll-mt-20">
        <PensionSimulator options={product.options} />
      </section>

      {/* 상품 상세정보 */}
      <section id="product-detail" className="mt-10 scroll-mt-20">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-[19px] font-semibold text-foreground">
            상품 상세정보
          </h2>
          <dl className="mt-4 divide-y divide-border">
            <DetailRow label="가입방법" value={product.joinWay} />
            <DetailRow label="판매개시일" value={formatDate(product.saleStartDay)} />
            <DetailRow
              label="유지건수"
              value={product.mntnCnt ? `${product.mntnCnt.toLocaleString()}건` : "-"}
            />
            <DetailRow label="연금종류" value={product.pnsnKindNm} />
            <DetailRow label="상품유형" value={product.prdtTypeNm} />
            <DetailRow label="공시기준" value={product.updatedAt} />
            {product.etc && <DetailRow label="기타사항" value={product.etc} />}
          </dl>
        </div>
      </section>

      {/* 하단 CTA */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/insurance"
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-border px-6 text-[15px] font-medium text-foreground transition-colors hover:bg-gray-50"
        >
          목록으로 돌아가기
        </Link>
        <a
          href={getCompanyUrl(product.finCoNo)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 text-[15px] font-medium text-white transition-colors hover:bg-primary-800"
        >
          {product.companyName} 홈페이지
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function ProfitRateBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const hasValue = value != null;
  const isPositive = hasValue && value >= 0;
  const barWidth = hasValue ? Math.min(Math.abs(value) * 10, 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-[13px] font-medium text-sub-text">{label}</p>
      {hasValue ? (
        <>
          <p
            className={`mt-1 text-[20px] font-bold ${isPositive ? "text-primary-700" : "text-red-600"}`}
          >
            {value > 0 ? "+" : ""}
            {value}%
          </p>
          <div className="mt-2 h-2 rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full ${isPositive ? "bg-primary-600" : "bg-red-400"}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-1 text-[20px] font-bold text-gray-300">-</p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-3.5">
      <dt className="w-[100px] shrink-0 text-[14px] font-medium text-sub-text">
        {label}
      </dt>
      <dd className="text-[15px] text-foreground">{value || "-"}</dd>
    </div>
  );
}
