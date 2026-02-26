import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getInsuranceProductById,
  getAllInsuranceProductIds,
} from "@/lib/insurance-db";
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

export async function generateStaticParams() {
  const ids = await getAllInsuranceProductIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getInsuranceProductById(id);
  if (!product) return { title: "상품을 찾을 수 없습니다" };

  const desc =
    product.category === "연금저축보험"
      ? `${product.companyName}의 ${product.productName}. ${product.pnsnKindNm}, ${product.prdtTypeNm}. 공시이율 ${product.dclsRate}%, 평균수익률 ${product.avgPrftRate}%.`
      : `${product.companyName}의 ${product.productName}. ${product.category}. ${product.coverageAmount}.`;

  return {
    title: `${product.productName} - ${product.companyName}`,
    description: desc,
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
    <div className="rounded-xl border border-border bg-white p-(--space-card-pad)">
      <p className="text-(--text-body-sm) font-medium text-sub-text">{label}</p>
      <p
        className={`mt-1 text-(--text-page-title) font-bold ${accent ? "text-primary-700" : "text-foreground"}`}
      >
        {display}
      </p>
    </div>
  );
}

export default async function InsuranceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getInsuranceProductById(id);
  if (!product) notFound();

  const isPension = product.category === "연금저축보험";

  return (
    <div className="mx-auto max-w-4xl px-(--space-page-x) py-(--space-page-y)">
      <ScrollToTop />
      <DetailFloatingNav />

      {/* 뒤로가기 */}
      <Link
        href="/insurance"
        className="inline-flex items-center gap-1.5 text-(--text-body) text-sub-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        보험상품 목록
      </Link>

      {/* 상단 헤더 */}
      <section id="product-info" className="scroll-mt-20">
        <div className="mt-6 flex items-start gap-4 sm:gap-5">
          {product.finCoNo && (
            <Image
              src={`/images/company/${product.finCoNo}.png`}
              alt={product.companyName}
              width={80}
              height={80}
              className="h-14 w-14 shrink-0 rounded-full sm:h-20 sm:w-20"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-(--text-caption) font-semibold text-teal-700">
                {product.category}
              </span>
              {isPension && product.prdtTypeNm && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-(--text-caption) font-semibold text-blue-700">
                  {product.prdtTypeNm}
                </span>
              )}
              {product.contractType && (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-(--text-caption) font-semibold text-purple-700">
                  {product.contractType === "renewal" ? "갱신형" : "비갱신형"}
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-(--text-caption) font-medium text-sub-text">
                {product.source === "fss_api" ? "금감원 공시" : "수동 수집"}
              </span>
            </div>
            <p className="mt-2 text-(--text-body) font-medium text-primary-700">
              {product.companyName}
            </p>
            <h1 className="mt-1 text-(--text-page-title) font-bold leading-tight text-foreground">
              {product.productName}
            </h1>
          </div>
        </div>

        {/* 연금: 금리/수익률 카드 */}
        {isPension && (
          <>
            <div className="mt-(--space-section-gap) grid gap-3 sm:grid-cols-3">
              <RateCard label="공시이율" value={product.dclsRate} accent />
              <RateCard
                label="최저보증이율"
                value={product.guarRate ? "별도" : "-"}
                unit=""
              />
              <RateCard label="연평균수익률" value={product.avgPrftRate} />
            </div>

            {product.guarRate && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-(--text-body-sm) font-semibold text-amber-800">
                  최저보증이율 상세
                </p>
                <p className="mt-1 whitespace-pre-line text-(--text-body) leading-relaxed text-amber-700">
                  {product.guarRate.replace(/\\r\\n|\\r|\\n/g, "\n").replace(/\r\n|\r/g, "\n")}
                </p>
              </div>
            )}
          </>
        )}

        {/* 간병/치매/실손: 보험료 카드 */}
        {!isPension && (
          <div className="mt-(--space-section-gap) grid gap-3 sm:grid-cols-2">
            <RateCard
              label="65세 남성 월 보험료"
              value={product.premium65m != null ? product.premium65m.toLocaleString() : null}
              unit="원"
              accent
            />
            <RateCard
              label="65세 여성 월 보험료"
              value={product.premium65f != null ? product.premium65f.toLocaleString() : null}
              unit="원"
            />
          </div>
        )}
      </section>

      {/* 연금: 기간별 수익률 */}
      {isPension && (
        <section id="profit-rate" className="mt-(--space-section-gap) scroll-mt-20">
          <h2 className="text-(--text-section-title) font-semibold text-foreground">
            기간별 수익률
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ProfitRateBar label="최근 1년" value={product.btrmPrftRate1} />
            <ProfitRateBar label="최근 2년" value={product.btrmPrftRate2} />
            <ProfitRateBar label="최근 3년" value={product.btrmPrftRate3} />
          </div>
        </section>
      )}

      {/* 연금: 시뮬레이터 */}
      {isPension && product.options.length > 0 && (
        <section id="pension-calc" className="mt-(--space-section-gap) scroll-mt-20">
          <PensionSimulator options={product.options} />
        </section>
      )}

      {/* 보장 내용 (간병/치매/실손) */}
      {!isPension && product.conditions && (
        <section className="mt-(--space-section-gap) scroll-mt-20">
          <div className="rounded-2xl border border-border bg-white p-(--space-card-pad) sm:p-6">
            <h2 className="text-(--text-section-title) font-semibold text-foreground">
              가입 조건
            </h2>
            <p className="mt-3 whitespace-pre-line text-(--text-body) leading-relaxed text-foreground">
              {product.conditions}
            </p>
          </div>
        </section>
      )}

      {/* 상품 상세정보 */}
      <section id="product-detail" className="mt-(--space-section-gap) scroll-mt-20">
        <div className="rounded-2xl border border-border bg-white p-(--space-card-pad) sm:p-6">
          <h2 className="text-(--text-section-title) font-semibold text-foreground">
            상품 상세정보
          </h2>
          <dl className="mt-4 divide-y divide-border">
            {product.joinWay && <DetailRow label="가입방법" value={product.joinWay} />}
            <DetailRow label="판매개시일" value={formatDate(product.saleStartDay)} />
            {isPension && (
              <DetailRow
                label="유지건수"
                value={product.mntnCnt ? `${product.mntnCnt.toLocaleString()}건` : "-"}
              />
            )}
            {product.pnsnKindNm && <DetailRow label="연금종류" value={product.pnsnKindNm} />}
            {product.prdtTypeNm && <DetailRow label="상품유형" value={product.prdtTypeNm} />}
            <DetailRow label="가입연령" value={`만 ${product.minAge}~${product.maxAge}세`} />
            <DetailRow label="데이터 기준" value={product.updatedAt} />
            {product.etc && <DetailRow label="기타사항" value={product.etc} />}
          </dl>
        </div>
      </section>

      {/* 하단 CTA */}
      <div className="mt-(--space-section-gap) flex flex-col gap-3 sm:flex-row">
        <Link
          href="/insurance"
          className="inline-flex min-h-(--min-tap) flex-1 items-center justify-center rounded-xl border border-border px-6 text-(--text-btn) font-medium text-foreground transition-colors hover:bg-gray-50"
        >
          목록으로 돌아가기
        </Link>
        <a
          href={product.finCoNo ? getCompanyUrl(product.finCoNo) : product.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-(--min-tap) flex-1 items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 text-(--text-btn) font-medium text-white transition-colors hover:bg-primary-800"
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
    <div className="rounded-xl border border-border bg-white p-(--space-card-pad)">
      <p className="text-(--text-body-sm) font-medium text-sub-text">{label}</p>
      {hasValue ? (
        <>
          <p
            className={`mt-1 text-(--text-number) font-bold ${isPositive ? "text-primary-700" : "text-red-600"}`}
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
        <p className="mt-1 text-(--text-number) font-bold text-gray-300">-</p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 sm:gap-4 sm:py-3.5">
      <dt className="w-[80px] shrink-0 text-(--text-body-sm) font-medium text-sub-text sm:w-[100px]">
        {label}
      </dt>
      <dd className="text-(--text-body) text-foreground">{value || "-"}</dd>
    </div>
  );
}
