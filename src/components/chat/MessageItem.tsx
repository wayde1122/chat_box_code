import React from "react";
import type { ChatMessage } from "@/types/chat";
import { AgentSteps } from "./AgentSteps";
import { User, Bot, Sparkles } from "lucide-react";

export function MessageItem({ msg }: { msg: ChatMessage }) {
  const isUser = msg.type === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* 头像 */}
      <div
        className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
            : "bg-gradient-to-br from-emerald-500 to-teal-500"
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
        {/* 发送者信息 */}
        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
          <span>{isUser ? "我" : "智能助手"}</span>
          {!isUser && msg.usedTools && (
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="h-3 w-3" />
              使用了工具
            </span>
          )}
          <span className="text-slate-500">
            {new Date(msg.timestamp).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* 消息气泡 */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-tr-sm"
              : "bg-slate-800/90 text-slate-100 border border-slate-700/50 rounded-tl-sm backdrop-blur-sm"
          }`}
        >
          <div className="whitespace-pre-wrap">{isUser ? msg.question : msg.answer}</div>

          {/* Agent 思考步骤（仅助手消息） */}
          {!isUser && msg.steps && msg.steps.length > 0 && (
            <AgentSteps steps={msg.steps} />
          )}
        </div>
      </div>
    </div>
  );
}
