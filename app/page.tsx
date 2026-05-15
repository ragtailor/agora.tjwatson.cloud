"use client";

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from "react";
import { Send, Loader2, RefreshCw, Database, MessageCircle } from "lucide-react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Message {
  role: "user" | "assistant";
  text: string;
  ts: string;
  confidence?: number;
  sources?: string[];
}

interface QaResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

interface SampleDataItem {
  [key: string]: string | number | boolean | null;
}

export default function TitanicQaApp() {
  const [view, setView] = useState<"qa" | "sample">("qa");

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gemini QA Assistant
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            재미나이 질의응답
          </p>
        </header>

        {/* View Toggle */}
        <nav className="flex gap-2 mb-6 justify-center">
          <button
            type="button"
            onClick={() => setView("qa")}
            aria-label="QA 채팅 보기"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              view === "qa"
                ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
            }`}
          >
            <MessageCircle size={18} />
            <span>QA 채팅</span>
          </button>
          <button
            type="button"
            onClick={() => setView("sample")}
            aria-label="샘플 데이터 보기"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              view === "sample"
                ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
            }`}
          >
            <Database size={18} />
            <span>샘플 데이터</span>
          </button>
        </nav>

        {/* Content */}
        {view === "qa" ? <TitanicQAPage /> : <TitanicSampleDataPage />}
      </div>
    </main>
  );
}

function TitanicQAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuestion = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: question.trim(),
      ts: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);
    setLastQuestion(question.trim());

    try {
      const res = await fetch(`${apiBaseUrl}/titanic/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status}`);
      }

      const data: QaResponse = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        text: data.answer,
        ts: new Date().toISOString(),
        confidence: data.confidence,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastQuestion(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  };

  const handleRetry = () => {
    if (lastQuestion) {
      sendQuestion(lastQuestion);
    }
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>질문을 입력해 보세요!</p>
            <p className="text-sm mt-1">예: 25세 남성 3등석 생존 가능성은?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={`${msg.ts}-${idx}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>

              {msg.role === "assistant" && msg.confidence !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">신뢰도:</span>{" "}
                    {(msg.confidence * 100).toFixed(1)}%
                  </p>
                  {msg.sources && msg.sources.length > 0 && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">출처:</span>{" "}
                      {msg.sources.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <p
                className={`text-xs mt-2 ${
                  msg.role === "user"
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-500 dark:text-gray-500"
                }`}
              >
                {formatTime(msg.ts)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <Loader2 size={20} className="animate-spin text-gray-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between gap-2">
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            aria-label="다시 시도"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-950 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <RefreshCw size={14} />
            <span>재시도</span>
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="question-input" className="sr-only">
            질문 입력
          </label>
          <textarea
            ref={textareaRef}
            id="question-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 25세 남성 3등석 생존 가능성은?"
            maxLength={500}
            rows={2}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 resize-none disabled:opacity-50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="질문 전송"
          className="self-end px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
        {input.length}/500 · Enter로 전송, Shift+Enter로 줄바꿈
      </p>
    </div>
  );
}

function TitanicSampleDataPage() {
  const [data, setData] = useState<SampleDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiBaseUrl}/titanic/data`);

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status}`);
      }

      const result: SampleDataItem[] = await res.json();
      setData(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "데이터를 불러올 수 없습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatValue = (value: string | number | boolean | null): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
        <button
          type="button"
          onClick={fetchData}
          aria-label="데이터 다시 불러오기"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
        >
          <RefreshCw size={16} />
          <span>다시 시도</span>
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Database size={48} className="mx-auto mb-4 opacity-50" />
        <p>데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          총 {data.length}개의 샘플 데이터
        </p>
        <button
          type="button"
          onClick={fetchData}
          aria-label="데이터 새로고침"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
        >
          <RefreshCw size={14} />
          <span>새로고침</span>
        </button>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
        {data.map((item, idx) => (
          <article
            key={idx}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              승객 #{idx + 1}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {formatKey(key)}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
