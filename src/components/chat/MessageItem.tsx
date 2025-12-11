import React from "react";
import type { ChatMessage } from "@/types/chat";

export function MessageItem({ msg }: { msg: ChatMessage }) {
  const isUser = msg.type === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-slate-800 text-slate-100 border border-slate-700"
        }`}
      >
        <div className="font-medium opacity-90">
          {isUser ? "我" : `助手 · ${msg.model}`}
        </div>
        <div className="mt-1 whitespace-pre-wrap">
          {isUser ? msg.question : msg.answer}
        </div>
        <div className="mt-2 text-[11px] opacity-60">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

