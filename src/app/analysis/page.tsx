import type { Metadata } from "next";
import HealthCheckAnalyzer from "@/components/analysis/HealthCheckAnalyzer";

export const metadata: Metadata = {
  title: "건강검진 결과 분석",
  description:
    "건강검진 결과표 사진이나 PDF를 올리면 어르신도 이해하기 쉽게 AI가 설명해드립니다.",
};

export default function AnalysisPage() {
  return <HealthCheckAnalyzer />;
}
