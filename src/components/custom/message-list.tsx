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

export function MessageList() {
  const { thread } = useTamboThread();
  const { isPending } = useTamboThreadInput();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or when pending
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
              {/* Text content */}
              {message.content.map((contentPart, idx) => {
                if (contentPart.type === "text") {
                  return (
                    <p
                      key={idx}
                      className={`text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                        isUser ? "text-white" : "text-white/80"
                      }`}
                    >
                      {contentPart.text}
                    </p>
                  );
                }
                return null;
              })}

              {/* Tool call indicator */}
              {message.role === "assistant" && message.toolCallRequest && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
                  <span className="text-[11px] text-white/30 font-medium tracking-wide">
                    {message.toolCallRequest.toolName}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isPending && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
