import { Bot } from "lucide-react";

export function TypingIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* 头像 */}
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 animate-pulse-slow">
        <Bot className="h-5 w-5 text-white" />
      </div>

      {/* 输入指示器 */}
      <div className="flex items-center gap-1 bg-slate-800/60 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700/50">
        <span className="typing-dot inline-block w-2 h-2 bg-violet-400 rounded-full" />
        <span className="typing-dot inline-block w-2 h-2 bg-cyan-400 rounded-full" />
        <span className="typing-dot inline-block w-2 h-2 bg-pink-400 rounded-full" />
        <span className="ml-2 text-sm text-slate-400">AI 正在思考...</span>
      </div>
    </div>
  );
}
