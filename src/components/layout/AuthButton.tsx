"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }, [supabase.auth]);

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="flex h-8 items-center rounded-lg bg-primary-700 px-3 text-[13px] font-medium text-white transition-colors hover:bg-primary-800 sm:h-9 sm:px-4 sm:text-[14px]"
      >
        로그인
      </Link>
    );
  }

  const nickname =
    user.user_metadata?.name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "사용자";
  const avatar: string | undefined = user.user_metadata?.avatar_url;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-primary-200 transition-colors hover:border-primary-400 sm:h-9 sm:w-9"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={nickname}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserIcon className="h-4 w-4 text-primary-600" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-white py-1.5 shadow-lg">
          <div className="border-b border-border px-4 py-2.5">
            <p className="truncate text-body-sm font-medium text-foreground">
              {nickname}
            </p>
            <p className="truncate text-caption text-sub-text">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2 px-4 py-2.5 text-body-sm text-sub-text transition-colors hover:bg-gray-50 hover:text-foreground",
            )}
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
