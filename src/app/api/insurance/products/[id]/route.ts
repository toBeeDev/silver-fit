import { NextRequest, NextResponse } from "next/server";
import { getInsuranceProductById } from "@/lib/insurance-db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/insurance/products/:id */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const product = await getInsuranceProductById(id);

  if (!product) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ product });
}
