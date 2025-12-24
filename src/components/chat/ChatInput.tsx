"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (q: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export function ChatInput({ onSend, disabled, initialValue = "" }: ChatInputProps) {
  const [value, setValue] = React.useState(initialValue);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // 当 initialValue 改变时更新输入值
  React.useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  const submit = () => {
    const q = value.trim();
    if (!q || disabled) return;
    onSend(q);
    setValue("");
  };

  // 自动调整高度
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value]);

  return (
    <div className="border-t border-violet-500/10 bg-slate-900/80 backdrop-blur-xl p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 glass rounded-2xl p-2 border border-violet-500/20">
          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="输入您的问题，例如：北京明天天气怎么样？"
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-slate-100 placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />

          {/* 发送按钮 */}
          <Button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed btn-glow transition-all"
            aria-label="发送"
          >
            {disabled ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-xs text-slate-500 mt-2">
          按 Enter 发送 · Shift + Enter 换行 · 
          <span className="text-violet-400">Powered by DeepSeek V3</span>
        </p>
      </div>
    </div>
  );
}
