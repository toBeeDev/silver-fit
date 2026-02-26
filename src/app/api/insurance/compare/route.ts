import { NextRequest, NextResponse } from "next/server";
import { getCompareProducts } from "@/lib/insurance-db";

/** POST /api/insurance/compare — 최대 3개 상품 비교 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const ids: unknown = body.product_ids;

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 3) {
    return NextResponse.json(
      { error: "product_ids는 1~3개의 UUID 배열이어야 합니다." },
      { status: 400 },
    );
  }

  const products = await getCompareProducts(ids as string[]);

  if (products.length === 0) {
    return NextResponse.json(
      { error: "해당 상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ products });
}
