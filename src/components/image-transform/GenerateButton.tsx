"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  /** 点击回调 */
  onClick: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否可以生成（条件满足） */
  canGenerate?: boolean;
}

/**
 * 生成按钮组件
 * 移动端底部悬浮，桌面端内联
 */
export function GenerateButton({
  onClick,
  disabled = false,
  loading = false,
  canGenerate = false,
}: GenerateButtonProps) {
  const buttonContent = loading ? (
    <span className="flex items-center gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="animate-pulse">正在施展魔法... ✨</span>
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <Sparkles className="h-5 w-5" />
      开始转换
    </span>
  );

  const buttonClass = `
    w-full h-12 font-semibold rounded-xl transition-all duration-300
    flex items-center justify-center
    ${canGenerate && !loading
      ? "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl cursor-pointer"
      : "bg-slate-700 text-slate-400 cursor-not-allowed"
    }
    ${loading ? "cursor-wait" : ""}
  `;

  return (
    <>
      {/* 桌面端按钮 */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading || !canGenerate}
        className={`hidden md:flex ${buttonClass}`}
      >
        {buttonContent}
      </button>

      {/* 移动端底部悬浮按钮 */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 md:hidden z-50">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || loading || !canGenerate}
          className={buttonClass}
        >
          {buttonContent}
        </button>
        {/* 预计耗时提示 */}
        {loading && (
          <p className="text-center text-xs text-slate-500 mt-2">
            预计需要 5-8 秒，请稍候...
          </p>
        )}
      </div>
    </>
  );
}
