import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SilverFit - 노인 복지혜택 맞춤 추천";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1a1f36 0%, #1d3461 40%, #1d4ed8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* 배경 장식 */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.1)",
          }}
        />

        {/* 로고 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#93c5fd",
              letterSpacing: -1,
            }}
          >
            Silver
          </span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            Fit
          </span>
        </div>

        {/* 타이틀 */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 20,
          }}
        >
          부모님 맞춤 복지혜택을 한눈에
        </div>

        {/* 서브 */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          기초연금 · 건강검진 · 돌봄서비스 · 보험비교 · AI 상담
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            background: "#fbbf24",
            color: "#1a1f36",
            fontSize: 22,
            fontWeight: 700,
            padding: "14px 40px",
            borderRadius: 14,
          }}
        >
          silverfit.kr 에서 확인하기
        </div>
      </div>
    ),
    { ...size },
  );
}
