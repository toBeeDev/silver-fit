"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * URL searchParams와 동기화되는 상태 훅.
 * 뒤로가기 시에도 상태가 유지된다.
 */
export function useQueryState(key: string, defaultValue = "") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === defaultValue || next === "") {
        params.delete(key);
      } else {
        params.set(key, next);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname, key, defaultValue],
  );

  return [value, setValue] as const;
}

/**
 * 여러 키를 한번에 읽고 쓰는 헬퍼.
 * 페이지 전환 없이 여러 파라미터를 동시에 업데이트할 때 사용.
 */
export function useQueryStates<T extends Record<string, string>>(
  defaults: T,
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const values = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const v = searchParams.get(key);
      if (v != null) (result as Record<string, string>)[key] = v;
    }
    return result;
  }, [searchParams, defaults]);

  const setValues = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined || val === "" || val === defaults[key]) {
          params.delete(key);
        } else {
          params.set(key, val as string);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname, defaults],
  );

  return [values, setValues] as const;
}
