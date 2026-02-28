"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  MessageSquare,
  Eye,
  PenSquare,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Search,
} from "lucide-react";
import { cn, maskNickname } from "@/lib/utils";
import type { PostRow, ProfileRow } from "@/types/supabase";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "general", label: "자유" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보공유" },
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  general: "자유",
  question: "질문",
  info: "정보공유",
};

const PAGE_SIZE = 10;

type PostWithProfile = PostRow & {
  profiles: Pick<ProfileRow, "nickname" | "avatar_url">;
};

export default function CommunityClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const category = searchParams.get("cat") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const searchQuery = searchParams.get("q") ?? "";

  const [notices, setNotices] = useState<PostWithProfile[]>([]);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase.auth]);

  // 검색어 변경 시 input 동기화
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // 공지 조회 (1페이지 + 검색 없을 때만)
  const fetchNotices = useCallback(async () => {
    if (page !== 1 || searchQuery) {
      setNotices([]);
      return;
    }

    const { data } = await supabase
      .from("posts")
      .select("*, profiles!inner(nickname, avatar_url)")
      .eq("is_notice", true)
      .order("created_at", { ascending: false })
      .limit(5);

    setNotices((data as unknown as PostWithProfile[]) ?? []);
  }, [supabase, page, searchQuery]);

  // 일반 게시글 조회
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("posts")
      .select("*, profiles!inner(nickname, avatar_url)", { count: "exact" })
      .eq("is_notice", false)
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (category) {
      query = query.eq("category", category);
    }

    if (searchQuery.trim()) {
      query = query.ilike("title", `%${searchQuery.trim()}%`);
    }

    const { data, count } = await query;
    setPosts((data as unknown as PostWithProfile[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [supabase, category, page, searchQuery]);

  useEffect(() => {
    fetchNotices();
    fetchPosts();
  }, [fetchNotices, fetchPosts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function setParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/community?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setParams({ q: inputValue.trim(), page: "" });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "방금";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function renderPostRow(post: PostWithProfile, isNotice: boolean) {
    return (
      <Link
        key={post.id}
        href={`/community/${post.id}`}
        className={cn(
          "flex flex-col gap-1.5 px-4 py-3.5 transition-colors sm:px-5 sm:py-4",
          isNotice
            ? "bg-primary-50/60 hover:bg-primary-50"
            : "hover:bg-gray-50",
        )}
      >
        <div className="flex items-center gap-2">
          {isNotice ? (
            <span className="flex items-center gap-0.5 rounded bg-primary-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
              <Megaphone className="h-2.5 w-2.5" />
              공지
            </span>
          ) : (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-medium",
                post.category === "question"
                  ? "bg-amber-50 text-amber-600"
                  : post.category === "info"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-sub-text",
              )}
            >
              {CATEGORY_LABEL[post.category] ?? "자유"}
            </span>
          )}
          <h3
            className={cn(
              "line-clamp-1 flex-1 text-body font-medium text-foreground",
              isNotice && "font-semibold",
            )}
          >
            {post.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-caption text-sub-text">
          <span>{maskNickname(post.profiles?.nickname ?? "사용자")}</span>
          <span>{formatDate(post.created_at)}</span>
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {post.view_count}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3" />
            {post.comment_count}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-(--space-page-x) pb-10 pt-6 sm:pt-10">
      {/* 헤더: 타이틀 + 검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-section-title font-bold text-foreground sm:text-page-title">
            커뮤니티
          </h1>
          <p className="mt-1 text-body-sm text-sub-text">
            복지·보험 이야기를 함께 나눠요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub-text" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="제목 검색"
              className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-body-sm text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none sm:h-10"
            />
          </form>
          {userId && (
            <Link
              href="/community/write"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary-700 px-3 text-[13px] font-medium text-white transition-colors hover:bg-primary-800 sm:h-10 sm:px-4 sm:text-[14px]"
            >
              <PenSquare className="h-3.5 w-3.5" />
              글쓰기
            </Link>
          )}
        </div>
      </div>

      {/* 카테고리 필터 + 건수 */}
      <div className="mt-4 flex items-center justify-between sm:mt-5">
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setParams({ cat: cat.value, page: "", q: searchQuery })}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium transition-all sm:px-3.5 sm:text-label",
                category === cat.value
                  ? "bg-primary-700 text-white"
                  : "bg-gray-100 text-sub-text hover:bg-gray-200",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {!loading && (
          <span className="text-caption text-sub-text">
            {total}건{searchQuery && ` · "${searchQuery}"`}
          </span>
        )}
      </div>

      {/* 게시글 목록 */}
      <div className="mt-3 sm:mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          </div>
        ) : notices.length === 0 && posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
            <p className="text-body font-medium text-foreground">
              {searchQuery
                ? `"${searchQuery}" 검색 결과가 없습니다`
                : category
                  ? "해당 카테고리에 아직 게시글이 없습니다"
                  : "아직 게시글이 없습니다"}
            </p>
            <p className="mt-2 text-body-sm text-sub-text">
              {searchQuery ? "다른 키워드로 검색해보세요" : "첫 번째 글을 작성해보세요"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-white">
            {/* 공지 (최상단 고정) */}
            {notices.map((post) => renderPostRow(post, true))}

            {/* 공지와 일반글 사이 구분선 강조 */}
            {notices.length > 0 && posts.length > 0 && (
              <div className="border-t border-border" />
            )}

            {/* 일반 게시글 */}
            {posts.map((post) => renderPostRow(post, false))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1">
          <button
            onClick={() => setParams({ page: String(page - 1) })}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sub-text transition-colors hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
            )
            .map((p, i, arr) => {
              const prev = arr[i - 1];
              const showEllipsis = prev != null && p - prev > 1;
              return (
                <span key={p} className="contents">
                  {showEllipsis && (
                    <span className="px-1 text-caption text-sub-text">...</span>
                  )}
                  <button
                    onClick={() => setParams({ page: String(p) })}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-body-sm font-medium transition-colors",
                      p === page
                        ? "bg-primary-700 text-white"
                        : "text-sub-text hover:bg-gray-100",
                    )}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
          <button
            onClick={() => setParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sub-text transition-colors hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 비로그인 글쓰기 유도 */}
      {!userId && !loading && (
        <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-center">
          <p className="text-body-sm text-primary-700">
            <Link href="/login?next=/community" className="font-semibold underline">
              로그인
            </Link>
            하면 글을 작성하고 댓글을 남길 수 있어요
          </p>
        </div>
      )}
    </div>
  );
}
