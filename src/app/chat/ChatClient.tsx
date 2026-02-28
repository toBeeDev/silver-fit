"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  RotateCcw,
  MessageCircle,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────

interface Attachment {
  file: File;
  name: string;
  type: "image" | "pdf";
  previewUrl: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  attachment?: { name: string; type: "image" | "pdf" };
}

// ─── Constants ──────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "기초연금 받을 수 있나요?",
  "간병보험 추천해주세요",
  "장기요양 등급 신청 방법",
  "치매보험 vs 간병보험",
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "안녕하세요! SilverFit AI 상담사입니다.\n복지혜택, 보험 상품, 신청 방법까지 편하게 물어보세요.",
};

// ─── Markdown renderer ─────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split("\n");
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul
        key={`list-${nodes.length}`}
        className="mt-1 flex flex-col gap-0.5 pl-1"
      >
        {listBuffer.map((item, j) => (
          <li key={j} className="flex gap-1.5">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-current opacity-40" />
            <span>{parseInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.slice(2));
      continue;
    }

    flushList();

    if (line.startsWith("## ")) {
      const heading = line.slice(3).replace(/^#+\s*/, "");
      nodes.push(
        <h3
          key={`h-${i}`}
          className={cn(
            "text-[15px] font-semibold text-foreground",
            i > 0 && "mt-3",
          )}
        >
          {parseInline(heading)}
        </h3>,
      );
    } else if (line.startsWith("### ")) {
      const heading = line.slice(4).replace(/^#+\s*/, "");
      nodes.push(
        <h4
          key={`h-${i}`}
          className={cn(
            "text-[14px] font-semibold text-foreground",
            i > 0 && "mt-2",
          )}
        >
          {parseInline(heading)}
        </h4>,
      );
    } else if (line.trim() === "") {
      if (i > 0 && i < lines.length - 1) {
        nodes.push(<div key={`sp-${i}`} className="h-1" />);
      }
    } else {
      nodes.push(
        <p key={`p-${i}`} className={cn(i > 0 && "mt-1")}>
          {parseInline(line)}
        </p>,
      );
    }
  }

  flushList();
  return nodes;
}

// ─── Sub-components ─────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary-700 text-white"
            : "rounded-tl-sm border border-border bg-white text-foreground shadow-sm",
        )}
      >
        {message.attachment && (
          <div
            className={cn(
              "mb-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px]",
              isUser ? "bg-primary-800/40" : "bg-gray-100",
            )}
          >
            {message.attachment.type === "image" ? (
              <ImageIcon className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            <span className="truncate">{message.attachment.name}</span>
          </div>
        )}
        {isUser
          ? message.content.split("\n").map((line, i) => (
              <p key={i} className={cn(i > 0 && "mt-1.5")}>
                {line}
              </p>
            ))
          : renderMarkdown(message.content)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700">
        <MessageCircle className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex items-end gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-[6px] w-[6px] rounded-full bg-primary-600"
                style={{
                  animation: "typing-dot 1.4s ease-in-out infinite",
                  animationDelay: `${i * 200}ms`,
                }}
              />
            ))}
          </div>
          <span className="text-[13px] text-sub-text">답변 작성중</span>
        </div>
      </div>
    </div>
  );
}

// ─── Speech Recognition helper ──────────────────────────────

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const recognition: SpeechRecognitionLike = new SR();
  recognition.lang = "ko-KR";
  recognition.continuous = false;
  recognition.interimResults = false;
  return recognition;
}

// ─── Main component ─────────────────────────────────────────

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [listening, setListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── File handling ──

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachment({
        file,
        name: file.name,
        type: isImage ? "image" : "pdf",
        previewUrl: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const removeAttachment = useCallback(() => {
    setAttachment(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  // ── Voice handling ──

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
  }, [listening]);

  // ── Send ──

  const send = useCallback(
    async (text?: string) => {
      const msg = text ?? input.trim();
      if ((!msg && !attachment) || loading) return;
      setInput("");

      const userMessage: Message = {
        role: "user",
        content: msg || (attachment ? `${attachment.name} 분석 요청` : ""),
        attachment: attachment
          ? { name: attachment.name, type: attachment.type }
          : undefined,
      };

      const next: Message[] = [...messages, userMessage];
      setMessages(next);
      setLoading(true);

      const currentAttachment = attachment;
      setAttachment(null);
      if (fileRef.current) fileRef.current.value = "";

      try {
        const prevMessages = next
          .filter((m) => m !== INITIAL_MESSAGE)
          .slice(0, -1)
          .map((m) => ({ role: m.role, content: m.content }));

        let res: Response;

        if (currentAttachment) {
          const formData = new FormData();
          formData.append("messages", JSON.stringify(prevMessages));
          formData.append("text", msg || "이 파일을 분석해주세요.");
          formData.append("file", currentAttachment.file);
          res = await fetch("/api/chat", { method: "POST", body: formData });
        } else {
          res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: next.filter((m) => m !== INITIAL_MESSAGE),
            }),
          });
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMessages([...next, { role: "assistant", content: data.content }]);
      } catch {
        setMessages([
          ...next,
          {
            role: "assistant",
            content: "오류가 발생했어요. 잠시 후 다시 시도해주세요.",
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, messages, attachment],
  );

  function resetChat() {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setAttachment(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const showSuggestions = messages.length === 1;
  const [hasSpeech, setHasSpeech] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setHasSpeech(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* Chat header */}
      <div className="shrink-0 border-b border-border bg-white/80 pt-16 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700">
              <MessageCircle className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground">
                AI 상담사
              </p>
              <p className="text-caption text-sub-text">
                복지혜택 · 보험 상담
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-caption font-medium text-sub-text transition-colors hover:bg-gray-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              새 대화
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-6">
          {showSuggestions ? (
            /* ── 초기 웰컴 화면 ── */
            <div className="flex flex-1 flex-col items-center justify-center py-8 sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <h2 className="mt-4 text-[17px] font-semibold text-foreground">
                무엇이든 물어보세요
              </h2>
              <p className="mt-1.5 text-center text-[14px] leading-relaxed text-sub-text">
                복지혜택, 보험 상품, 신청 방법까지
                <br />
                편하게 질문해보세요
              </p>

              <div className="mt-8 grid w-full max-w-md auto-rows-fr grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="flex items-center rounded-xl border border-border bg-white px-3 py-3 text-left text-[13px] leading-snug text-foreground transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── 대화 메시지 ── */
            <>
              {messages
                .filter((m) => m !== INITIAL_MESSAGE)
                .map((m, i) => (
                  <MessageBubble key={i} message={m} />
                ))}
              {loading && <TypingIndicator />}
            </>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
        {/* 파일 미리보기 */}
        {attachment && (
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 pt-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2">
              {attachment.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachment.previewUrl}
                  alt="미리보기"
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <FileText className="h-5 w-5 shrink-0 text-primary-600" />
              )}
              <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                {attachment.name}
              </span>
              <button
                onClick={removeAttachment}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sub-text transition-colors hover:bg-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-5 py-3">
          {/* 파일 첨부 */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sub-text transition-colors hover:bg-gray-100 disabled:opacity-40"
            aria-label="파일 첨부"
          >
            <Paperclip className="h-[18px] w-[18px]" />
          </button>

          {/* 음성 입력 */}
          {hasSpeech && (
            <button
              onClick={toggleVoice}
              disabled={loading}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40",
                listening
                  ? "bg-red-100 text-red-600"
                  : "text-sub-text hover:bg-gray-100",
              )}
              aria-label={listening ? "음성 입력 중지" : "음성 입력"}
            >
              {listening ? (
                <MicOff className="h-[18px] w-[18px]" />
              ) : (
                <Mic className="h-[18px] w-[18px]" />
              )}
            </button>
          )}

          {/* 텍스트 입력 */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              listening
                ? "듣고 있어요..."
                : "궁금한 것을 편하게 질문해보세요..."
            }
            className={cn(
              "flex-1 rounded-full border bg-gray-50 px-4 py-2.5 text-[15px] text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none",
              listening ? "border-red-300" : "border-border",
            )}
            disabled={loading}
          />

          {/* 전송 */}
          <button
            onClick={() => send()}
            disabled={(!input.trim() && !attachment) || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white transition-colors hover:bg-primary-800 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p className="pb-1 text-center text-[11px] text-sub-text/60">
          AI 응답은 참고용이며, 정확한 내용은 관련 기관에 확인하세요.
        </p>
      </div>
    </div>
  );
}
