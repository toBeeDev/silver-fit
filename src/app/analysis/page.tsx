import type { Metadata } from "next";
import HealthCheckAnalyzer from "@/components/analysis/HealthCheckAnalyzer";

export const metadata: Metadata = {
  title: "AI 검진결과 분석",
  description:
    "건강검진 결과표를 사진이나 PDF로 올리면, AI가 수치를 해석하고 쉬운 말로 설명해드립니다.",
};

export default function AnalysisPage() {
  return <HealthCheckAnalyzer />;
}
