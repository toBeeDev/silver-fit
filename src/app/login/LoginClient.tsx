"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Shield } from "lucide-react";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[65dvh] max-w-sm flex-col items-center justify-center px-(--space-page-x)">
      <div className="w-full">
        {/* 로고 + 타이틀 */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <Shield className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="mt-4 text-page-title font-bold text-foreground">
            SilverFit 로그인
          </h1>
          <p className="mt-1.5 text-body-sm text-sub-text">
            커뮤니티 참여를 위해 로그인해주세요
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-center text-body-sm text-red-600">
            로그인에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        {/* 소셜 로그인 버튼 */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl text-[15px] font-semibold shadow-sm transition-all hover:brightness-[0.97] active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "#FEE500", color: "#191919" }}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 3C5.58 3 2 5.79 2 9.21c0 2.17 1.45 4.08 3.63 5.17l-.93 3.41c-.08.3.26.54.52.37l4.07-2.68c.23.02.47.03.71.03 4.42 0 8-2.79 8-6.3C18 5.79 14.42 3 10 3Z"
                fill="#191919"
              />
            </svg>
            {loading ? "연결 중..." : "카카오로 시작하기"}
          </button>
        </div>

        <p className="mt-6 text-center text-body-sm leading-relaxed text-sub-text">
          로그인 없이도 복지혜택 검색, 보험 비교,
          <br />
          AI 상담 기능을 자유롭게 이용할 수 있어요
        </p>

        <p className="mt-5 text-center text-caption text-sub-text/60">
          로그인 시 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  );
}
