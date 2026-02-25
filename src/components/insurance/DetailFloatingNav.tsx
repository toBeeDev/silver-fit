"use client";

import { Info, TrendingUp, Calculator, FileText } from "lucide-react";
import FloatingNav from "@/components/common/FloatingNav";
import type { FloatingNavItem } from "@/components/common/FloatingNav";

const NAV_ITEMS: FloatingNavItem[] = [
  { id: "product-info", label: "상품정보", icon: <Info className="h-4 w-4" /> },
  { id: "profit-rate", label: "수익률", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "pension-calc", label: "연금계산기", icon: <Calculator className="h-4 w-4" /> },
  { id: "product-detail", label: "상세정보", icon: <FileText className="h-4 w-4" /> },
];

export default function DetailFloatingNav() {
  return <FloatingNav items={NAV_ITEMS} />;
}
