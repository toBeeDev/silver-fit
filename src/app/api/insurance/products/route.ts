import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { InsuranceProductRow } from "@/types/supabase";
import { INSURANCE_CATEGORY_TO_TYPE } from "@/types/insurance";
import type { InsuranceCategory } from "@/types/insurance";

/**
 * GET /api/insurance/products
 * ?type=care|dementia|medical|pension|간병보험|치매보험|실손보험|연금저축보험
 * &company=삼성생명
 * &age=65
 * &sort=premium_asc|premium_desc|rate_asc|rate_desc
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const typeParam = searchParams.get("type");
  const company = searchParams.get("company");
  const age = searchParams.get("age");
  const sort = searchParams.get("sort");

  let query = supabase
    .from("insurance_products")
    .select("*")
    .eq("is_active", true);

  // 타입 필터 (한글 카테고리명도 지원)
  if (typeParam) {
    const dbType =
      INSURANCE_CATEGORY_TO_TYPE[typeParam as InsuranceCategory] ?? typeParam;
    query = query.eq("insurance_type", dbType);
  }

  // 회사 필터
  if (company) {
    query = query.ilike("company", `%${company}%`);
  }

  // 나이 필터
  if (age) {
    const ageNum = parseInt(age, 10);
    if (!isNaN(ageNum)) {
      query = query.lte("min_age", ageNum).gte("max_age", ageNum);
    }
  }

  // 정렬
  if (sort === "premium_asc") {
    query = query.order("premium_65m", { ascending: true, nullsFirst: false });
  } else if (sort === "premium_desc") {
    query = query.order("premium_65m", { ascending: false, nullsFirst: false });
  } else if (sort === "rate_desc") {
    query = query.order("avg_prft_rate", { ascending: false, nullsFirst: false });
  } else if (sort === "rate_asc") {
    query = query.order("avg_prft_rate", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("company", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data as InsuranceProductRow[],
    total: (data ?? []).length,
  });
}
