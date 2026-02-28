import type { Metadata } from "next";
import PostDetailClient from "./PostDetailClient";

export const metadata: Metadata = {
  title: "게시글",
};

export const dynamic = "force-dynamic";

export default function PostDetailPage() {
  return <PostDetailClient />;
}
