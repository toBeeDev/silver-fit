"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Megaphone,
  Trash2,
  Send,
} from "lucide-react";
import { cn, maskNickname } from "@/lib/utils";
import type { PostRow, CommentRow, ProfileRow } from "@/types/supabase";

const CATEGORY_LABEL: Record<string, string> = {
  general: "자유",
  question: "질문",
  info: "정보공유",
};

type PostWithProfile = PostRow & {
  profiles: Pick<ProfileRow, "nickname" | "avatar_url">;
};

type CommentWithProfile = CommentRow & {
  profiles: Pick<ProfileRow, "nickname" | "avatar_url">;
};

export default function PostDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase.auth]);

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles!inner(nickname, avatar_url)")
      .eq("id", Number(id))
      .single();

    setPost(data as unknown as PostWithProfile | null);
    setLoading(false);
  }, [supabase, id]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles!inner(nickname, avatar_url)")
      .eq("post_id", Number(id))
      .order("created_at", { ascending: true });

    setComments((data as unknown as CommentWithProfile[]) ?? []);
  }, [supabase, id]);

  useEffect(() => {
    fetchPost();
    fetchComments();
    // 조회수 증가
    fetch(`/api/community/${id}/view`, { method: "POST" });
  }, [fetchPost, fetchComments, id]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    const res = await fetch(`/api/community/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment as CommentWithProfile]);
      setCommentText("");
      // 댓글 수 업데이트
      setPost((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev,
      );
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    const res = await fetch(`/api/community/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/community");
    }
    setDeleting(false);
  }

  async function handleDeleteComment(commentId: number) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/community/comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count - 1 } : prev,
      );
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40dvh] max-w-3xl items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-(--space-page-x) py-20 text-center">
        <p className="text-section-title font-medium text-foreground">
          게시글을 찾을 수 없습니다
        </p>
        <Link
          href="/community"
          className="mt-4 inline-flex items-center gap-1 text-body-sm text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
      </div>
    );
  }

  const isAuthor = userId === post.author_id;

  return (
    <div className="mx-auto max-w-3xl px-(--space-page-x) pb-10 pt-4 sm:pt-8">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-body-sm text-sub-text transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Link>

      {/* 글 본문 */}
      <article className="mt-4 rounded-xl border border-border bg-white">
        <div className="px-4 pt-4 sm:px-6 sm:pt-5">
          {/* 카테고리 + 제목 */}
          <div className="flex items-center gap-2">
            {post.is_notice && (
              <span className="flex items-center gap-0.5 rounded bg-primary-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                <Megaphone className="h-2.5 w-2.5" />
                공지
              </span>
            )}
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
          </div>
          <h1 className="mt-2 text-card-title font-bold text-foreground sm:text-section-title">
            {post.title}
          </h1>

          {/* 작성자 정보 */}
          <div className="mt-3 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-foreground">
                {maskNickname(post.profiles?.nickname ?? "사용자")}
              </span>
              <span className="text-caption text-sub-text">
                {formatDate(post.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-caption text-sub-text">
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {post.view_count}
              </span>
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-0.5 text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="whitespace-pre-wrap text-body leading-relaxed text-foreground">
            {post.content}
          </div>
        </div>
      </article>

      {/* 댓글 영역 */}
      <div className="mt-5">
        <h2 className="flex items-center gap-1.5 text-body font-semibold text-foreground">
          <MessageSquare className="h-4 w-4" />
          댓글 {post.comment_count}
        </h2>

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-white">
            {comments.map((comment) => (
              <div key={comment.id} className="px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-medium text-foreground">
                      {maskNickname(comment.profiles?.nickname ?? "사용자")}
                    </span>
                    <span className="text-caption text-sub-text">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  {userId === comment.author_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-caption text-red-400 transition-colors hover:text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-body-sm leading-relaxed text-foreground">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 댓글 입력 */}
        {userId ? (
          <form onSubmit={handleComment} className="mt-3 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-body-sm text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-700 text-white transition-colors hover:bg-primary-800 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="mt-3 rounded-lg border border-primary-100 bg-primary-50 px-4 py-2.5 text-center text-body-sm text-primary-700">
            <Link href={`/login?next=/community/${id}`} className="font-semibold underline">
              로그인
            </Link>
            하면 댓글을 작성할 수 있어요
          </div>
        )}
      </div>
    </div>
  );
}
