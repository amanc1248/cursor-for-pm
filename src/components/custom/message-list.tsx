"use client";

import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { useEffect, useRef } from "react";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/30"
              style={{
                animation: "typing-bounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Render simple markdown bold (**text**) as <strong> */
function FormattedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

/** Check if text looks like raw JSON / tool output */
function looksLikeToolOutput(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return true;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return true;
  return false;
}

export function MessageList() {
  const { thread } = useTamboThread();
  const { isPending } = useTamboThreadInput();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, isPending]);

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white/20 text-sm">
          <div
            className="w-1.5 h-1.5 rounded-full bg-white/20"
            style={{
              animation: "typing-bounce 1.2s ease-in-out infinite",
            }}
          />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
      {thread.messages.map((message) => {
        const isUser = message.role === "user";

        // Skip tool-result messages (they show raw JSON)
        if (message.role === "tool") return null;

        // Check if this is a tool-call-only message with no meaningful text
        const hasToolCall = message.role === "assistant" && message.toolCallRequest;
        const textParts = message.content.filter(
          (c) => c.type === "text" && c.text?.trim()
        );

        // If the only text content looks like raw JSON, skip it
        const allTextIsJson =
          textParts.length > 0 &&
          textParts.every((c) => c.type === "text" && looksLikeToolOutput(c.text ?? ""));
        if (allTextIsJson) return null;

        // If it's a tool call with no text, show a compact indicator
        if (hasToolCall && textParts.length === 0) {
          return (
            <div key={message.id} className="flex justify-start animate-fade-in-up">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03]">
                <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                <span className="text-[11px] text-white/25 font-medium tracking-wide">
                  @{message.toolCallRequest!.toolName}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                isUser
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-md"
                  : "bg-white/[0.04] text-white/90 rounded-bl-md"
              }`}
            >
              {message.content.map((contentPart, idx) => {
                if (contentPart.type === "text" && contentPart.text?.trim()) {
                  // Skip raw JSON in assistant messages
                  if (!isUser && looksLikeToolOutput(contentPart.text)) return null;
                  return (
                    <FormattedText
                      key={idx}
                      text={contentPart.text}
                      className={`text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                        isUser ? "text-white" : "text-white/80"
                      }`}
                    />
                  );
                }
                return null;
              })}

              {hasToolCall && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                  <span className="text-[11px] text-white/30 font-medium tracking-wide">
                    @{message.toolCallRequest!.toolName}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isPending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
