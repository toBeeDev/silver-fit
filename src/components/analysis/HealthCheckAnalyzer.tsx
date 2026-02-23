"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { MoveRight, Upload, RotateCcw, FileText } from "lucide-react";

interface AnalysisRecord {
  id: string;
  fileName: string;
  date: string;
  summary: string;
  result: string;
}

const STORAGE_KEY = "silverfit-analysis-history";
const MAX_HISTORY = 10;

function loadHistory(): AnalysisRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalysisRecord[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: AnalysisRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
}

const ANALYSIS_TAGS = [
  "혈당(공복/당화혈색소)",
  "콜레스테롤(LDL/HDL)",
  "혈압",
  "간수치(AST/ALT/GGT)",
  "신장기능(크레아티닌)",
  "빈혈(헤모글로빈)",
  "갑상선",
  "암표지자",
];

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2
          key={i}
          className="mt-8 mb-3 border-b border-border pb-2 text-[18px] font-bold text-foreground first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="mt-5 mb-2 text-[16px] font-semibold text-primary-700">
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith("- "))
      return (
        <div key={i} className="py-0.5 pl-3 text-[15px] leading-relaxed text-sub-text">
          {line}
        </div>
      );
    if (line.includes("⚠️"))
      return (
        <div key={i} className="text-[15px] font-semibold leading-relaxed text-amber-600">
          {line}
        </div>
      );
    if (line.includes("✅"))
      return (
        <div key={i} className="text-[15px] font-semibold leading-relaxed text-success-600">
          {line}
        </div>
      );
    if (line.startsWith("⚕️"))
      return (
        <div
          key={i}
          className="mt-6 rounded-xl bg-primary-50 px-4 py-3 text-[13px] leading-relaxed text-sub-text"
        >
          {line}
        </div>
      );
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <div key={i} className="text-[15px] leading-relaxed text-sub-text">
        {line}
      </div>
    );
  });
}

export default function HealthCheckAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const processFile = useCallback((f: File | undefined) => {
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    const isPdf = f.type === "application/pdf";
    if (!isImage && !isPdf) {
      setError("이미지(JPG, PNG) 또는 PDF 파일만 업로드 가능해요.");
      return;
    }
    setError("");
    setResult("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) =>
      setPreview({
        url: e.target?.result as string,
        type: isImage ? "image" : "pdf",
        name: f.name,
      });
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile],
  );

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 중 오류가 발생했어요.");

      const text = data.result as string;
      setResult(text);

      // localStorage에 저장
      const record: AnalysisRecord = {
        id: crypto.randomUUID(),
        fileName: file.name,
        date: new Date().toISOString(),
        summary: text.replace(/[#*\n]/g, " ").trim().slice(0, 100),
        result: text,
      };
      const updated = [record, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 중 오류가 발생했어요.");
    }
    setLoading(false);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult("");
    setError("");
  }

  function loadFromHistory(record: AnalysisRecord) {
    setResult(record.result);
    setFile(null);
    setPreview(null);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <div className="-mt-16">
      {/* Section 1: 업로드 폼 */}
      <section className="full-section relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/97" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-16 sm:flex-row sm:items-center sm:gap-16 sm:py-0">
          {/* Left — 헤딩 */}
          <div className="shrink-0 sm:w-[280px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-sub-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              Health Analysis
            </span>
            <h1 className="mt-6 text-4xl font-normal tracking-tight text-foreground md:text-5xl">
              검진결과
              <br />
              분석
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
              검진 결과표를 올리시면,
              <br className="hidden sm:block" />
              쉬운 말로 설명해드립니다
            </p>

            {/* Trust indicators */}
            <div className="mt-8 hidden flex-col gap-3 sm:flex">
              {[
                "이미지·PDF 파일 지원",
                "AI 기반 수치 해석",
                "개인정보 서버 미저장",
              ].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 text-[14px] text-sub-text"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-600" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 업로드 */}
          <div className="w-full flex-1">
            {/* 면책 배너 */}
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-800">
              ⚠️ 이 서비스는 <strong>참고용 설명</strong>을 제공하며, 의학적
              진단이 아닙니다. 정확한 진단은 의사 선생님께 받으세요.
            </div>

            {/* 업로드 영역 */}
            <div
              onClick={() => !preview && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                dragOver
                  ? "border-primary-600 bg-primary-50"
                  : preview
                    ? "border-success-600/40 bg-success-50/30"
                    : "border-border bg-white hover:border-primary-200 cursor-pointer"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => processFile(e.target.files?.[0])}
              />

              {preview ? (
                <div>
                  {preview.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview.url}
                      alt="검진결과 미리보기"
                      className="mx-auto max-h-[280px] rounded-lg object-contain"
                    />
                  ) : (
                    <div className="py-6">
                      <FileText className="mx-auto h-12 w-12 text-primary-600" />
                      <p className="mt-3 font-medium text-foreground">
                        {preview.name}
                      </p>
                      <p className="mt-1 text-[14px] text-sub-text">
                        PDF 파일 업로드 완료
                      </p>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[14px] text-sub-text transition-colors hover:bg-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    다시 선택
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-10 w-10 text-sub-text" />
                  <p className="mt-4 text-[17px] font-medium text-foreground">
                    검진 결과표를 올려주세요
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-sub-text">
                    클릭하거나 파일을 끌어다 놓으세요
                    <br />
                    JPG, PNG, PDF 지원 (최대 10MB)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                {error}
              </div>
            )}

            {/* 분석 버튼 */}
            <div className="mt-6">
              <Button
                size="lg"
                className="w-full gap-4"
                disabled={!preview || loading}
                onClick={analyze}
              >
                {loading ? "분석 중..." : "결과 분석하기"}
                {!loading && <MoveRight className="h-4 w-4" />}
              </Button>
            </div>

            {loading && (
              <p className="mt-4 text-center text-[14px] text-sub-text">
                AI가 검진 결과를 읽고 설명을 작성하고 있어요 (10~30초 소요)
              </p>
            )}

            {/* 지원 항목 태그 */}
            <div className="mt-8">
              <p className="mb-3 text-[14px] font-medium text-foreground">
                이런 항목을 설명해드려요
              </p>
              <div className="flex flex-wrap gap-2">
                {ANALYSIS_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary-50 px-3 py-1 text-[12px] font-medium text-primary-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 분석 결과 */}
      {result && (
        <section
          ref={resultsRef}
          className="relative min-h-[100dvh] overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/testimonial-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-background/95" />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-16 sm:flex-row sm:items-start sm:gap-16 sm:py-20">
            {/* Left — 헤딩 */}
            <div className="shrink-0 sm:w-[260px]">
              <span className="text-xs font-medium uppercase tracking-widest text-sub-text">
                Analysis
              </span>
              <h2 className="mt-4 text-4xl font-normal tracking-tight text-foreground md:text-5xl">
                분석
                <br />
                결과
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
                검진 결과를 쉬운 말로
                <br className="hidden sm:block" />
                설명해드렸어요
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link href="/recommend">
                  <Button variant="outline" className="gap-4">
                    복지혜택 확인하기 <MoveRight className="h-4 w-4" />
                  </Button>
                </Link>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-[14px] text-sub-text transition-colors hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  다른 결과표 분석하기
                </button>
              </div>
            </div>

            {/* Right — 결과 */}
            <div className="w-full flex-1">{renderMarkdown(result)}</div>
          </div>
        </section>
      )}

      {/* Section 3: 분석 이력 */}
      {history.length > 0 && !result && (
        <section className="relative min-h-[50dvh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/benefits-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-background/95" />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-16 sm:flex-row sm:items-start sm:gap-16 sm:py-20">
            {/* Left — 헤딩 */}
            <div className="shrink-0 sm:w-[260px]">
              <span className="text-xs font-medium uppercase tracking-widest text-sub-text">
                History
              </span>
              <h2 className="mt-4 text-4xl font-normal tracking-tight text-foreground md:text-5xl">
                분석
                <br />
                이력
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
                이전에 분석한
                <br className="hidden sm:block" />
                결과를 다시 볼 수 있어요
              </p>
            </div>

            {/* Right — 이력 리스트 */}
            <div className="w-full flex-1">
              {history.map((record, i) => (
                <button
                  key={record.id}
                  onClick={() => loadFromHistory(record)}
                  className="group flex w-full items-center gap-5 border-b border-border/60 py-7 text-left transition-colors first:border-t hover:bg-white/40 sm:gap-6 sm:py-8"
                >
                  <span className="w-[60px] shrink-0 text-4xl font-extralight tabular-nums text-primary-200 sm:w-[72px] sm:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-0.5 text-xs font-medium text-sub-text">
                      <span className="h-1 w-1 rounded-full bg-primary-600" />
                      {new Date(record.date).toLocaleDateString("ko-KR")}
                    </span>
                    <h3 className="mt-2 text-[20px] font-medium leading-tight text-foreground transition-colors group-hover:text-primary-700 sm:text-[22px]">
                      {record.fileName}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-[15px] text-sub-text">
                      {record.summary}
                    </p>
                  </div>
                  <MoveRight className="hidden h-4 w-4 shrink-0 translate-x-0 text-sub-text opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
