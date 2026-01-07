"use client";

import React from "react";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import type { DigestStatus } from "@/types/news";

interface ProgressBarProps {
  /** 进度百分比 0-100 */
  progress: number;
  /** 进度文本 */
  progressText: string;
  /** 当前状态 */
  status: DigestStatus;
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
  // 空状态
  if (status === "idle") {
    return null;
  }

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "from-emerald-500 to-teal-500";
      case "error":
        return "from-red-500 to-rose-500";
      default:
        return "from-amber-500 to-orange-500";
    }
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
    }
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-3">
        {/* 状态图标 */}
        {getStatusIcon()}

        {/* 进度信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300 truncate">
              {status === "error" ? error : progressText}
            </span>
            <span className="text-sm text-slate-500 ml-2 flex-shrink-0">
              {progress}%
            </span>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 重试按钮 */}
        {status === "error" && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400
                       hover:text-slate-200 bg-slate-800/50 rounded-lg border
                       border-slate-700 hover:border-slate-600 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
        )}
      </div>
    </div>
  );
}
