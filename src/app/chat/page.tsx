import type { Metadata } from "next";
import ChatClient from "./ChatClient";

export const metadata: Metadata = {
  title: "AI 상담",
  description:
    "복지혜택, 보험 상품, 신청 방법까지 AI 상담사에게 편하게 물어보세요.",
};

export default function ChatPage() {
  return <ChatClient />;
}
