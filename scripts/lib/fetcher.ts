import { BOKJIRO_DETAIL_URL } from "./config.js";
import type { Logger } from "./logger.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchBokjiroPage(
  wlfareInfoId: string,
  options: { delayMs: number; maxRetries: number; logger: Logger }
): Promise<string> {
  const url = `${BOKJIRO_DETAIL_URL}?wlfareInfoId=${wlfareInfoId}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    if (attempt > 0) {
      const backoff = options.delayMs * Math.pow(2, attempt - 1);
      options.logger.warn(
        `재시도 ${attempt}/${options.maxRetries} (${wlfareInfoId}) ${backoff}ms 후...`
      );
      await sleep(backoff);
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SilverFit-Crawler/1.0 (+https://silverfit.kr)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "ko-KR,ko;q=0.9",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      if (!html.includes("initParameter") && !html.includes("wlfareInfoNm")) {
        throw new Error("페이지에 복지 데이터 마커가 없습니다");
      }

      return html;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      options.logger.error(
        `Fetch 실패 (${wlfareInfoId}): ${lastError.message}`
      );
    }
  }

  throw new Error(
    `${options.maxRetries + 1}회 시도 모두 실패 (${wlfareInfoId}): ${lastError?.message}`
  );
}
