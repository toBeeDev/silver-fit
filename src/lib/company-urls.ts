/** 금융사 코드(fin_co_no) → 자사 홈페이지 URL 매핑 */
const COMPANY_URLS: Record<string, string> = {
  // 생명보험
  "0010593": "https://www.hanwhalife.com",           // 한화생명
  "0010594": "https://www.abllife.co.kr",             // ABL생명
  "0010595": "https://www.samsunglife.com",           // 삼성생명
  "0010596": "https://www.heungkuklife.co.kr",        // 흥국생명
  "0010597": "https://www.kyobo.co.kr",               // 교보생명
  "0010599": "https://www.shinhanlife.co.kr",         // 신한라이프
  "0010607": "https://www.kdblife.co.kr",             // KDB생명
  "0010618": "https://www.hanalife.co.kr",            // 하나생명
  "0010622": "https://www.myangel.co.kr",             // 동양생명
  "0012455": "https://www.ibkpension.com",            // IBK연금보험
  "0013173": "https://www.nhlife.co.kr",              // 농협생명
  "0013436": "https://www.lifeplanet.co.kr",          // 교보라이프플래닛

  // 손해보험
  "0010626": "https://www.meritzfire.com",            // 메리츠화재
  "0010627": "https://www.hwgeneralins.com",          // 한화손해보험
  "0010628": "https://www.lotteins.co.kr",            // 롯데손해보험
  "0010630": "https://www.heungkukfire.co.kr",        // 흥국화재
  "0010633": "https://www.samsungfire.com",           // 삼성화재
  "0010634": "https://www.hi.co.kr",                  // 현대해상
  "0010635": "https://www.kbinsure.co.kr",            // KB손해보험
  "0010636": "https://www.idbins.com",                // DB손해보험
  "0011354": "https://www.hanainsure.co.kr",          // 하나손해보험

  // 자산운용
  "0010170": "https://www.hanafn.com",                // 하나자산운용
  "0010173": "https://www.samsungfund.com",           // 삼성자산운용
  "0010175": "https://www.woorifund.com",             // 우리자산운용
  "0010179": "https://www.daishinam.com",             // 대신자산운용
  "0010182": "https://www.kiwoomam.com",              // 키움투자자산운용
  "0010183": "https://www.kyoboaxa-im.co.kr",         // 교보악사자산운용
  "0010185": "https://www.syfund.co.kr",              // 신영자산운용
  "0010186": "https://www.shinhanamc.com",            // 신한자산운용
  "0010189": "https://www.hanwhaam.com",              // 한화자산운용
  "0010192": "https://www.dbasset.co.kr",             // DB자산운용
  "0010198": "https://www.kbam.co.kr",                // KB자산운용
  "0010199": "https://www.heungkukam.co.kr",          // 흥국자산운용
  "0010205": "https://www.miraeasset.com",            // 미래에셋자산운용
  "0010210": "https://www.daolam.com",                // 다올자산운용
  "0010654": "https://www.schroders.com/ko",          // 슈로더투자신탁운용
  "0010660": "https://www.kim.co.kr",                 // 한국투자신탁운용
  "0011317": "https://www.amundi.co.kr",              // NH아문디자산운용
  "0011458": "https://www.fidelity.co.kr",            // 피델리티자산운용
  "0011459": "https://www.ibkasset.com",              // IBK자산운용
  "0011644": "https://www.koreainvestvalue.com",      // 한국투자밸류자산운용
  "0011956": "https://www.assetplus.co.kr",           // 에셋플러스자산운용
  "0011959": "https://www.truston.com",               // 트러스톤자산운용
};

/** 회사명 → 금융사 코드 (수동 입력 상품용 로고 매핑) */
const COMPANY_NAME_TO_CODE: Record<string, string> = {
  한화생명: "0010593",
  삼성생명: "0010595",
  흥국생명: "0010596",
  교보생명: "0010597",
  신한라이프: "0010599",
  동양생명: "0010622",
  농협생명: "0013173",
  메리츠화재: "0010626",
  한화손해보험: "0010627",
  롯데손해보험: "0010628",
  흥국화재: "0010630",
  삼성화재: "0010633",
  현대해상: "0010634",
  "KB손해보험": "0010635",
  "DB손해보험": "0010636",
  농협손해보험: "0013173",
};

const FALLBACK_URL = "https://finlife.fss.or.kr";

export function getCompanyUrl(finCoNo: string): string {
  return COMPANY_URLS[finCoNo] ?? FALLBACK_URL;
}

/** 회사명으로 금융사 코드를 찾는다 (로고 파일 매핑용) */
export function getCompanyCode(companyName: string): string | null {
  return COMPANY_NAME_TO_CODE[companyName] ?? null;
}
