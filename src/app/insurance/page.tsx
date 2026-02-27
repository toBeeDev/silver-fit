import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllInsuranceProducts } from "@/lib/insurance-db";
import InsuranceCompareClient from "./InsuranceCompareClient";

export const metadata: Metadata = {
  title: "시니어 보험상품 비교",
  description:
    "간병보험, 실손보험, 치매보험, 연금저축보험 등 부모님을 위한 보험상품을 한눈에 비교하세요. 금감원 공시 데이터 기반.",
};

export default async function InsurancePage() {
  const products = await getAllInsuranceProducts();
  return (
    <Suspense>
      <InsuranceCompareClient products={products} />
    </Suspense>
  );
}
