import { redirect } from "next/navigation";

interface RecommendPageProps {
  searchParams: Promise<Record<string, string>>;
}

/**
 * /recommend → /benefits 리다이렉트
 * 기존 URL 파라미터 (age, region, income) 유지
 */
export default async function RecommendPage({
  searchParams,
}: RecommendPageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();

  if (sp.age) params.set("age", sp.age);
  if (sp.region && sp.region !== "전국") params.set("region", sp.region);
  if (sp.income && sp.income !== "무관") params.set("income", sp.income);

  const qs = params.toString();
  redirect(`/benefits${qs ? `?${qs}` : ""}`);
}
