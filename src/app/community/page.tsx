import type { Metadata } from "next";
import CommunityClient from "./CommunityClient";

export const metadata: Metadata = {
  title: "커뮤니티",
  description:
    "복지·보험 정보를 공유하고, 궁금한 점을 질문하세요. SilverFit 커뮤니티에서 함께 이야기 나눠요.",
};

export const dynamic = "force-dynamic";

export default function CommunityPage() {
  return <CommunityClient />;
}
