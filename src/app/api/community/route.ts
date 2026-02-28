import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { title, content, category, is_notice } = body as {
    title: string;
    content: string;
    category: string;
    is_notice?: boolean;
  };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "제목과 내용을 입력해주세요." },
      { status: 400 },
    );
  }

  const validCategories = ["general", "question", "info"];
  const cat = validCategories.includes(category) ? category : "general";

  // 공지 권한 확인: admin만 가능
  let notice = false;
  if (is_notice) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    notice = profile?.role === "admin";
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category: cat as "general" | "question" | "info",
      is_notice: notice,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Post create error:", error);
    return NextResponse.json(
      { error: "게시글 작성에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id });
}
