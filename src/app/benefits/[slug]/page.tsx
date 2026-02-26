import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import { getBenefitBySlug, getAllBenefitSlugs } from "@/lib/welfare-api";
import { MoveLeft, ArrowRight, Shield } from "lucide-react";

interface BenefitDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const slugs = getAllBenefitSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BenefitDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const benefit = getBenefitBySlug(decodeURIComponent(slug));

  if (!benefit) return { title: "혜택을 찾을 수 없습니다" };

  return {
    title: benefit.title,
    description: benefit.summary,
    openGraph: {
      title: `${benefit.title} | SilverFit`,
      description: benefit.summary,
    },
  };
}

export default async function BenefitDetailPage({
  params,
}: BenefitDetailPageProps) {
  const { slug } = await params;
  const benefit = getBenefitBySlug(decodeURIComponent(slug));

  if (!benefit) notFound();

  const infoItems = [
    { label: "지원금액", value: benefit.amount, highlight: true },
    {
      label: "대상연령",
      value: `만 ${benefit.ageRange.min}세${benefit.ageRange.max ? ` ~ ${benefit.ageRange.max}세` : " 이상"}`,
    },
    { label: "소득기준", value: benefit.incomeLevels.join(", ") },
    { label: "지역", value: benefit.regions.join(", ") },
    { label: "제공기관", value: benefit.provider },
    {
      label: "신청기간",
      value: `${benefit.startDate}${benefit.endDate ? ` ~ ${benefit.endDate}` : " ~ 상시"}`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      {/* 뒤로가기 */}
      <Link
        href="/benefits"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-sub-text transition-colors hover:text-foreground"
      >
        <MoveLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>

      <article className="mt-10">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
            {benefit.category}
          </span>
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
            {benefit.status}
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {benefit.title}
        </h1>

        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-sub-text">
          {benefit.summary}
        </p>

        {/* 핵심 정보 */}
        <div className="mt-12 border-t border-border pt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-sub-text">
            Key Information
          </h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="text-[14px] font-medium text-sub-text">
                  {item.label}
                </dt>
                <dd
                  className={`text-[17px] ${item.highlight ? "font-semibold text-primary-700" : "font-medium text-foreground"}`}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 상세 설명 */}
        <div className="mt-12 border-t border-border pt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-sub-text">
            Detail
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.8] text-foreground">
            {benefit.description}
          </p>
        </div>

        {/* 신청 방법 */}
        <div className="mt-12 border-t border-border pt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-sub-text">
            How to Apply
          </h2>

          <dl className="mt-6 flex flex-col gap-6">
            <div>
              <dt className="text-[14px] font-medium text-sub-text">
                신청 채널
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {benefit.application.methods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[14px] font-medium text-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary-600" />
                    {method}
                  </span>
                ))}
              </dd>
            </div>

            {benefit.application.phone && (
              <div>
                <dt className="text-[14px] font-medium text-sub-text">
                  문의 전화
                </dt>
                <dd className="mt-1 text-[17px] font-semibold text-primary-700">
                  {benefit.application.phone}
                </dd>
              </div>
            )}

            {benefit.application.documents.length > 0 && (
              <div>
                <dt className="text-[14px] font-medium text-sub-text">
                  필요 서류
                </dt>
                <dd className="mt-2">
                  <ul className="flex flex-col gap-2 text-[17px] leading-[1.7] text-foreground">
                    {benefit.application.documents.map((doc) => (
                      <li key={doc} className="flex items-start gap-2.5">
                        <span
                          className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600"
                          aria-hidden="true"
                        />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          {benefit.application.url && (
            <div className="mt-10">
              <a
                href={benefit.application.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="h-[48px] w-full px-6 text-[16px] sm:h-[60px] sm:w-auto sm:px-8 sm:text-[20px]">
                  온라인 신청하기
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* 태그 */}
        {benefit.tags.length > 0 && (
          <div className="mt-12 border-t border-border pt-10">
            <div className="flex flex-wrap gap-2">
              {benefit.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[13px] font-medium text-sub-text"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 보험상품 추천 CTA */}
        <div className="mt-12 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 sm:h-12 sm:w-12">
              <Shield className="h-5 w-5 text-primary-700 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-foreground sm:text-[19px]">
                복지혜택과 함께 보험도 비교해보세요
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-sub-text">
                간병보험, 치매보험, 실손보험, 연금저축보험 등 어르신을 위한 보험상품을 한눈에 비교할 수 있습니다.
              </p>
              <Link
                href="/insurance"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary-700 px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-primary-800"
              >
                보험상품 비교하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
