import type { Metadata } from "next";
import WriteClient from "./WriteClient";

export const metadata: Metadata = {
  title: "글쓰기",
};

export default function WritePage() {
  return <WriteClient />;
}
