import type { Metadata } from "next";
import { Suspense } from "react";
import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = {
  title: "보험상품 비교",
  description: "선택한 보험상품을 나란히 비교해보세요.",
};

export default function ComparePage() {
  return (
    <Suspense>
      <ComparePageClient />
    </Suspense>
  );
}
