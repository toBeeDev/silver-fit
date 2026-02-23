/** 복지혜택 카테고리 */
export type BenefitCategory =
  | "생활지원"
  | "의료건강"
  | "주거지원"
  | "일자리"
  | "문화여가"
  | "돌봄서비스"
  | "교통"
  | "기타";

/** 소득 기준 분위 */
export type IncomeLevel =
  | "기초생활"
  | "차상위"
  | "중위50"
  | "중위100"
  | "중위150"
  | "무관";

/** 신청 방법 */
export type ApplicationMethod = "온라인" | "방문" | "전화" | "우편";

/** 혜택 상태 */
export type BenefitStatus = "진행중" | "예정" | "마감";

/** 대상 연령 범위 */
export interface AgeRange {
  min: number;
  max: number | null;
}

/** 신청 정보 */
export interface ApplicationInfo {
  methods: ApplicationMethod[];
  url: string | null;
  phone: string | null;
  documents: string[];
}

/** 복지혜택 핵심 타입 */
export interface Benefit {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: BenefitCategory;
  provider: string;
  ageRange: AgeRange;
  incomeLevels: IncomeLevel[];
  regions: string[];
  amount: string;
  status: BenefitStatus;
  application: ApplicationInfo;
  startDate: string;
  endDate: string | null;
  tags: string[];
  updatedAt: string;
}

/** 혜택 필터 파라미터 */
export interface BenefitFilter {
  age?: number;
  region?: string;
  incomeLevel?: IncomeLevel;
  category?: BenefitCategory;
  keyword?: string;
}