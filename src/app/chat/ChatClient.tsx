"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "기초연금 받을 수 있는지 확인하고 싶어요",
  "부모님 간병보험 어떤 걸 골라야 할까요?",
  "장기요양 등급 신청은 어떻게 하나요?",
  "치매보험과 간병보험 차이가 뭔가요?",
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "안녕하세요! SilverFit AI 상담사입니다.\n복지혜택, 보험 상품, 신청 방법까지 편하게 물어보세요.",
};

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
        </div>
      </div>
    </div>
  );
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (text?: string) => {
      const msg = text ?? input.trim();
      if (!msg || loading) return;
      setInput("");

      const next: Message[] = [...messages, { role: "user", content: msg }];
      setMessages(next);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.filter((m) => m !== INITIAL_MESSAGE),
          }),
        });
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
    [input, loading, messages],
  );

  function resetChat() {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* Chat header — 글로벌 헤더 아래 */}
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
              <p className="text-caption text-sub-text">복지혜택 · 보험 상담</p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-caption font-medium text-sub-text transition-colors hover:bg-gray-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />새 대화
            </button>
          )}
        </div>
      </div>

      {/* Messages area — 이 영역만 스크롤 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-6">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {loading && <TypingIndicator />}

          {showSuggestions && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-center text-caption text-sub-text">
                이런 질문을 해보세요
              </p>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-left text-[15px] text-primary-700 transition-colors hover:bg-primary-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area — 바텀 고정 */}
      <div className="shrink-0 border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-3">
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
            placeholder="궁금한 것을 편하게 질문해보세요..."
            className="flex-1 rounded-full border border-border bg-gray-50 px-4 py-2.5 text-[15px] text-foreground placeholder:text-sub-text/50 focus:border-primary-400 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
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
