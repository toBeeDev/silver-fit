"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "general", label: "자유" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보공유" },
] as const;

export default function WriteClient() {
  const router = useRouter();
  const supabase = createClient();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setAuthed(false);
        router.replace("/login?next=/community/write");
        return;
      }
      setAuthed(true);

      // 관리자 여부 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        category,
        is_notice: isAdmin && isNotice,
      }),
    });

    if (res.ok) {
      const { id } = await res.json();
      router.push(`/community/${id}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "작성에 실패했습니다.");
      setSubmitting(false);
    }
  }

  if (authed === null) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (authed === false) return null;

  return (
    <div className="mx-auto max-w-3xl px-(--space-page-x) pb-10 pt-4 sm:pt-8">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-body-sm text-sub-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Link>

      <h1 className="mt-4 text-section-title font-bold text-foreground sm:text-page-title">
        글쓰기
      </h1>

      <form onSubmit={handleSubmit} className="mt-5">
        {/* 카테고리 + 공지 토글 */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-[13px] font-medium transition-all sm:text-label",
                  category === cat.value
                    ? "bg-primary-700 text-white"
                    : "bg-gray-100 text-sub-text hover:bg-gray-200",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsNotice((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium transition-all sm:text-label",
                isNotice
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-400 hover:bg-red-100",
              )}
            >
              <Megaphone className="h-3 w-3" />
              공지
            </button>
          )}
        </div>

        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={100}
          className="mt-4 h-11 w-full rounded-lg border border-border bg-white px-4 text-body font-medium text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none sm:h-12"
        />

        {/* 본문 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={12}
          className="mt-3 w-full resize-none rounded-lg border border-border bg-white p-4 text-body leading-relaxed text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none"
        />

        {error && (
          <p className="mt-2 text-body-sm text-red-500">{error}</p>
        )}

        {/* 버튼 */}
        <div className="mt-4 flex justify-end gap-2">
          <Link
            href="/community"
            className="flex h-10 items-center rounded-lg border border-border px-4 text-body-sm font-medium text-sub-text transition-colors hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 items-center rounded-lg bg-primary-700 px-5 text-body-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:opacity-50"
          >
            {submitting ? "작성 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
