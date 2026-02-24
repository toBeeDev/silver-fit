import { NextRequest, NextResponse } from "next/server";

const FSS_API_BASE = "http://finlife.fss.or.kr/finlifeapi";

export async function GET(request: NextRequest) {
  const apiKey = process.env.FSS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버 설정 오류: FSS API 키가 없습니다." },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const topFinGrpNo = searchParams.get("topFinGrpNo") || "050000";
  const pageNo = searchParams.get("pageNo") || "1";

  try {
    const url = `${FSS_API_BASE}/annuitySavingProductsSearch.json?auth=${apiKey}&topFinGrpNo=${topFinGrpNo}&pageNo=${pageNo}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      throw new Error(`금감원 API 응답 오류: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
