"use client";

import React from "react";
import { CheckCircle2, Loader2, XCircle, RefreshCw } from "lucide-react";
import type { ResearchStatus } from "@/types/research";

interface ProgressBarProps {
  /** 进度百分比 0-100 */
  progress: number;
  /** 进度文本 */
  progressText: string;
  /** 当前状态 */
  status: ResearchStatus;
  /** 错误信息 */
  error?: string;
  /** 重试回调 */
  onRetry?: () => void;
}

export function ProgressBar({
  progress,
  progressText,
  status,
  error,
  onRetry,
}: ProgressBarProps) {
  // 空闲状态不显示
  if (status === "idle") {
    return null;
  }

  const isCompleted = status === "completed";
  const isError = status === "error";
  const isRunning = !isCompleted && !isError;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-4">
        {/* 状态图标 */}
        <div className="flex-shrink-0">
          {isCompleted && (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          )}
          {isError && (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          {isRunning && (
            <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
          )}
        </div>

        {/* 进度信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium truncate ${
                isError ? "text-red-400" : "text-slate-300"
              }`}
            >
              {error ?? progressText}
            </span>
            <span className="text-sm text-slate-500 ml-2 flex-shrink-0">
              {Math.round(progress)}%
            </span>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isError
                  ? "bg-red-500"
                  : isCompleted
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-violet-500 to-cyan-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* 重试按钮 */}
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm
                       text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg
                       border border-red-500/30 hover:border-red-500/50 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
        )}
      </div>

      {/* 阶段指示器 */}
      {isRunning && (
        <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-700/50">
          <StageIndicator
            label="规划"
            isActive={status === "planning"}
            isCompleted={status === "executing" || status === "reporting"}
          />
          <div className="w-8 h-px bg-slate-700" />
          <StageIndicator
            label="执行"
            isActive={status === "executing"}
            isCompleted={status === "reporting"}
          />
          <div className="w-8 h-px bg-slate-700" />
          <StageIndicator
            label="报告"
            isActive={status === "reporting"}
            isCompleted={false}
          />
        </div>
      )}
    </div>
  );
}

/** 阶段指示器 */
interface StageIndicatorProps {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

function StageIndicator({ label, isActive, isCompleted }: StageIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          w-3 h-3 rounded-full transition-all
          ${isCompleted ? "bg-emerald-500" : ""}
          ${isActive ? "bg-violet-500 ring-4 ring-violet-500/30" : ""}
          ${!isActive && !isCompleted ? "bg-slate-600" : ""}
        `}
      />
      <span
        className={`text-xs ${
          isActive
            ? "text-violet-400 font-medium"
            : isCompleted
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
