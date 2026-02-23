import * as cheerio from "cheerio";
import { BOKJIRO_DETAIL_URL } from "./config.js";

/** 복지로 페이지에서 추출한 원시 데이터 */
export interface BokjiroRawData {
  wlfareInfoId: string;
  wlfareInfoNm: string;
  wlfareInfoOutlCn: string;
  wlfareSprtTrgtCn: string;
  wlfareSprtTrgtSlcrCn: string;
  wlfareSprtBnftCn: string;
  aplyMtdDc: string;
  aplyMtdDcdnm: string;
  wlfareInfoAggrpCdnm: string;
  bizChrInstNm: string;
  bizChrDeptNm: string;
  rprsCtadr: string;
  mkclUrl: string;
  wlbzslTcdnm: string;
  tagNm: string;
  lastChgPtm: string;
  rawPageUrl: string;
}

/** HTML 태그 제거, 텍스트만 추출 */
function stripHtml(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(`<div>${html}</div>`);
  $("br").replaceWith("\n");
  $("p").each((_, el) => {
    $(el).prepend("\n");
    $(el).append("\n");
  });
  $("li").each((_, el) => {
    $(el).prepend("\n- ");
  });
  return $("div").first().text().replace(/\n{3,}/g, "\n\n").trim();
}

/** 복지로 페이지 HTML에서 dmWlfareInfo JSON 추출 */
export function parseBokjiroPage(
  html: string,
  wlfareInfoId: string
): BokjiroRawData {
  let dmInfo: Record<string, string> | null = null;

  // Strategy 1: initParameter({"initValue":{"dmWlfareInfo":"<escaped JSON>"}})
  // 실제 복지로 형태: dmWlfareInfo 값이 이중 직렬화된 JSON 문자열
  const dmStrMatch = html.match(/"dmWlfareInfo"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (dmStrMatch?.[1]) {
    try {
      // 이스케이프된 JSON 문자열을 파싱
      const unescaped = JSON.parse(`"${dmStrMatch[1]}"`);
      dmInfo = JSON.parse(unescaped);
    } catch {
      // Strategy 2로 폴백
    }
  }

  // Strategy 2: dmWlfareInfo가 객체로 직접 있는 경우
  if (!dmInfo) {
    const dmObjMatch = html.match(
      /"dmWlfareInfo"\s*:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/
    );
    if (dmObjMatch?.[1]) {
      try {
        dmInfo = JSON.parse(dmObjMatch[1]);
      } catch {
        // fall through
      }
    }
  }

  if (!dmInfo) {
    throw new Error(`dmWlfareInfo JSON 추출 실패: ${wlfareInfoId}`);
  }

  const dm = dmInfo;

  return {
    wlfareInfoId: dm["wlfareInfoId"] ?? wlfareInfoId,
    wlfareInfoNm: dm["wlfareInfoNm"] ?? "",
    wlfareInfoOutlCn: stripHtml(dm["wlfareInfoOutlCn"] ?? ""),
    wlfareSprtTrgtCn: stripHtml(dm["wlfareSprtTrgtCn"] ?? ""),
    wlfareSprtTrgtSlcrCn: stripHtml(dm["wlfareSprtTrgtSlcrCn"] ?? ""),
    wlfareSprtBnftCn: stripHtml(dm["wlfareSprtBnftCn"] ?? ""),
    aplyMtdDc: stripHtml(dm["aplyMtdDc"] ?? ""),
    aplyMtdDcdnm: dm["aplyMtdDcdnm"] ?? "",
    wlfareInfoAggrpCdnm: dm["wlfareInfoAggrpCdnm"] ?? "",
    bizChrInstNm: dm["bizChrInstNm"] ?? "",
    bizChrDeptNm: dm["bizChrDeptNm"] ?? "",
    rprsCtadr: dm["rprsCtadr"] ?? "",
    mkclUrl: dm["mkclUrl"] ?? "",
    wlbzslTcdnm: dm["wlbzslTcdnm"] ?? "",
    tagNm: dm["tagNm"] ?? "",
    lastChgPtm: dm["lastChgPtm"] ?? "",
    rawPageUrl: `${BOKJIRO_DETAIL_URL}?wlfareInfoId=${wlfareInfoId}`,
  };
}
