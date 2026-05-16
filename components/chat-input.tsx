"use client";

import { useState, useRef, KeyboardEvent, FormEvent } from "react";
import { Plus, Settings2, Mic, ChevronDown } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // TODO: 실제 채팅 기능 구현
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="border border-border rounded-2xl bg-secondary/30 overflow-hidden">
          <label htmlFor="chat-input" className="sr-only">
            메시지 입력
          </label>
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            rows={1}
            className="w-full px-4 pt-4 pb-2 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm"
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="파일 추가"
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={18} />
              </button>
              <button
                type="button"
                aria-label="도구"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <Settings2 size={16} />
                <span>Tools</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="모드 선택"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <span>Fast</span>
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                aria-label="음성 입력"
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
