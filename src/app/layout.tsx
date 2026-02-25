import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import FooterWrapper from "@/components/layout/FooterWrapper";

export const metadata: Metadata = {
  title: {
    default: "SilverFit - 노인 복지혜택 맞춤 추천",
    template: "%s | SilverFit",
  },
  description:
    "나이, 지역, 소득만 입력하면 받을 수 있는 복지혜택을 한눈에. 기초연금, 장기요양, 돌봄서비스 등 어르신 맞춤 혜택을 확인하세요.",
  keywords: ["노인 복지", "복지혜택", "기초연금", "노인일자리", "실버복지"],
  openGraph: {
    siteName: "SilverFit",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <HeaderWrapper />
        <div className="h-16" aria-hidden="true" />
        <main>{children}</main>
        <FooterWrapper />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
