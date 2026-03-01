import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import FooterWrapper from "@/components/layout/FooterWrapper";
import ScrollToTop from "@/components/layout/ScrollToTop";

const BASE_URL = "https://silverfit.kr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SilverFit - 노인 복지혜택 맞춤 추천",
    template: "%s | SilverFit",
  },
  description:
    "나이, 지역, 소득만 입력하면 받을 수 있는 복지혜택을 한눈에. 기초연금, 장기요양, 돌봄서비스 등 부모님 맞춤 혜택을 확인하세요.",
  keywords: ["노인 복지", "복지혜택", "기초연금", "노인일자리", "실버복지", "시니어 보험", "AI 검진분석"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    siteName: "SilverFit",
    locale: "ko_KR",
    type: "website",
    url: BASE_URL,
    images: [
      {
        url: "/silverfit.png",
        width: 1200,
        height: 630,
        alt: "SilverFit - 노인 복지혜택 맞춤 추천",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/silverfit.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content="b96a84ea8eb36e0e84c7514f769ac84e6028dfc2" />
      </head>
      <body className="font-sans antialiased">
        <ScrollToTop />
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
