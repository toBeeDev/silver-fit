import { loadConfig, CRAWL_TARGETS, type CrawlTarget } from "./lib/config.js";
import { fetchBokjiroPage } from "./lib/fetcher.js";
import { parseBokjiroPage } from "./lib/parser.js";
import { structureWithClaude } from "./lib/structurer.js";
import { validateBenefit } from "./lib/validator.js";
import { mergeBenefits } from "./lib/merger.js";
import { createLogger } from "./lib/logger.js";
import type { Benefit } from "../src/types/benefit.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CrawlItemResult {
  target: CrawlTarget;
  benefit: Benefit | null;
  error: string | null;
}

async function crawlSingle(
  target: CrawlTarget,
  config: ReturnType<typeof loadConfig>,
  logger: ReturnType<typeof createLogger>
): Promise<CrawlItemResult> {
  try {
    // 1. Fetch
    logger.info(`페이지 가져오는 중: ${target.label} (${target.id})`);
    const html = await fetchBokjiroPage(target.id, {
      delayMs: config.fetchDelayMs,
      maxRetries: config.maxRetries,
      logger,
    });
    logger.success(`페이지 수신: ${html.length}자`);

    // 2. Parse
    logger.info(`파싱 중: ${target.label}`);
    const rawData = parseBokjiroPage(html, target.id);
    logger.success(`파싱 완료: "${rawData.wlfareInfoNm}"`);

    // 3. Claude 구조화
    logger.info(`Claude로 구조화 중: ${target.label}`);
    const structured = await structureWithClaude(rawData, {
      apiKey: config.apiKey,
      model: config.model,
    });
    logger.success(`구조화 완료: id="${structured.id}"`);

    // 4. 검증
    const validation = validateBenefit(structured);
    if (!validation.success) {
      logger.error(`검증 실패 (${target.label}): ${validation.errors.join("; ")}`);
      return { target, benefit: null, error: `검증: ${validation.errors.join("; ")}` };
    }

    logger.success(`검증 통과: ${target.label}`);
    return { target, benefit: validation.data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`크롤링 실패 (${target.label}): ${message}`);
    return { target, benefit: null, error: message };
  }
}

async function main(): Promise<void> {
  const logger = createLogger();

  logger.info("=== SilverFit 복지혜택 크롤러 ===");
  logger.info(`대상: ${CRAWL_TARGETS.length}건`);

  const config = loadConfig();

  if (config.dryRun) {
    logger.warn("DRY RUN 모드: 파일을 수정하지 않습니다");
  }

  logger.info(`모델: ${config.model}`);
  logger.info(
    `Fetch 간격: ${config.fetchDelayMs}ms / API 간격: ${config.apiDelayMs}ms`
  );

  const results: CrawlItemResult[] = [];

  for (let i = 0; i < CRAWL_TARGETS.length; i++) {
    const target = CRAWL_TARGETS[i];
    logger.info(
      `\n--- [${i + 1}/${CRAWL_TARGETS.length}] ${target.label} ---`
    );

    const result = await crawlSingle(target, config, logger);
    results.push(result);

    // 다음 항목 전 대기 (마지막은 스킵)
    if (i < CRAWL_TARGETS.length - 1) {
      await sleep(config.fetchDelayMs);
    }
  }

  const successful = results
    .filter(
      (r): r is CrawlItemResult & { benefit: Benefit } => r.benefit !== null
    )
    .map((r) => r.benefit);

  const failed = results.filter((r) => r.error !== null);

  logger.info("\n=== 크롤링 완료 ===");
  logger.info(`성공: ${successful.length} / ${CRAWL_TARGETS.length}`);

  if (failed.length > 0) {
    logger.warn(`실패: ${failed.length}`);
    for (const f of failed) {
      logger.warn(`  - ${f.target.label}: ${f.error}`);
    }
  }

  if (successful.length === 0) {
    logger.error("성공한 항목이 없습니다. 머지를 건너뜁니다.");
    process.exit(1);
  }

  // 머지
  logger.info(
    `\n${successful.length}건을 ${config.benefitsJsonPath}에 머지 중...`
  );
  const mergeResult = await mergeBenefits(
    successful,
    config.benefitsJsonPath,
    config.dryRun
  );

  logger.info("\n=== 머지 결과 ===");
  logger.info(
    `추가:   ${mergeResult.added.length}건 (${mergeResult.added.join(", ") || "없음"})`
  );
  logger.info(
    `업데이트: ${mergeResult.updated.length}건 (${mergeResult.updated.join(", ") || "없음"})`
  );
  logger.info(`변경없음: ${mergeResult.unchanged.length}건`);
  logger.info(`전체:   ${mergeResult.total}건`);

  if (config.dryRun) {
    logger.warn("DRY RUN: 파일에 기록하지 않았습니다.");
  } else {
    logger.success("benefits.json 업데이트 완료!");
  }

  if (failed.length > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
