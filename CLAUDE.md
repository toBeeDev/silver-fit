# SilverFit 프로젝트 컨텍스트

## 서비스 개요

- **서비스명:** SilverFit (silverfit.kr)
- **목적:** 노인 복지혜택 정보 통합 포털 — 나이·지역·소득 입력 → 맞춤 혜택 자동 추천
- **타겟:** 노인 본인(60+) + 자녀 세대(3040)
- **수익화:** Google AdSense → 금융사/보험사 제휴 광고
- **핵심 전략:** SEO 중심 트래픽 (복지혜택 상세 페이지 SSG)

## 기술 스택

- **Framework:** Next.js 16.1 (App Router, Turbopack 기본값)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Runtime:** React 19.2
- **Infra:** AWS (CloudFront + EKS + Route 53)
- **Analytics:** GA4 + Google Search Console + Microsoft Clarity

## 핵심 디렉토리 구조

```
silverfit/
├── CLAUDE.md
├── .claude/
│   ├── pm.md
│   ├── designer.md
│   ├── developer.md
│   └── frontend.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # 랜딩
│   ├── 복지혜택/
│   │   ├── page.tsx              # 전체 목록
│   │   └── [slug]/page.tsx       # 상세 (SSG)
│   ├── 혜택추천/page.tsx          # 맞춤 추천
│   ├── 계산기/                    # Phase 2
│   ├── 블로그/
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                       # Button, Card, Badge, Input, Select
│   ├── benefits/                 # BenefitCard, BenefitList, BenefitFilter, BenefitRecommender
│   └── layout/                   # Header, Footer
├── lib/
│   ├── welfare-api.ts            # 복지로 OpenAPI 클라이언트
│   └── benefits.ts               # 필터/정렬 유틸
├── types/
│   └── benefit.ts                # Benefit 타입 정의
└── data/
    └── benefits.json             # 정적 혜택 데이터 (API fallback)
```

## 코드 규칙 (전체 공통)

- Next.js 16 breaking change: `params`/`searchParams`는 반드시 `async/await`로 접근
- `any` 타입 사용 금지 — `unknown` 또는 명시적 타입 사용
- 서버 컴포넌트 우선, `useEffect` 데이터 패칭 금지
- Turbopack 기본값 유지 — webpack 커스텀 설정 금지
- 모든 컴포넌트에 `types/benefit.ts` 타입 참조

## 디자인 원칙 (전체 공통)

- 시니어 UX: 최소 폰트 17px, 버튼 최소 52px 높이, 줄간격 1.7
- Primary: `#1D4ED8` / Accent: `#F59E0B` / Background: `#F8FAFC`
- 접근성: WCAG AA (대비율 4.5:1 이상) 필수
- Mobile First 반응형
