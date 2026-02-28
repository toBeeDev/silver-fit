import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 닉네임 마스킹: "승찬" → "*찬", "홍길동" → "**동", "A" → "*" */
export function maskNickname(name: string): string {
  if (!name) return "*";
  const chars = [...name];
  if (chars.length === 1) return "*";
  return "*".repeat(chars.length - 1) + chars[chars.length - 1];
}
