"use client";

import { useTamboThread } from "@tambo-ai/react";

export function MessageList() {
    const { thread } = useTamboThread();

    if (!thread) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Loading conversation...
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {thread.messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                >
                    <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-gray-100 border border-slate-700"
                            }`}
                    >
                        {/* Render text content */}
                        {message.content.map((contentPart, idx) => {
                            if (contentPart.type === "text") {
                                return (
                                    <p key={idx} className="text-sm whitespace-pre-wrap">
                                        {contentPart.text}
                                    </p>
                                );
                            }
                            return null;
                        })}

                        {/* Show tool calls */}
                        {message.role === "assistant" && message.toolCallRequest && (
                            <div className="mt-2 text-xs text-gray-400 italic">
                                → {message.toolCallRequest.toolName}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
