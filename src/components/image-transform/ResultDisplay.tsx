"use client";

import React, { useCallback, useState } from "react";
import { Download, Share2, RefreshCw, Check } from "lucide-react";

interface ResultDisplayProps {
  /** 生成图 URL */
  generatedUrl: string;
  /** 耗时（毫秒） */
  duration?: number | null;
  /** 重新生成回调 */
  onRegenerate?: () => void;
  /** 是否正在生成 */
  isGenerating?: boolean;
}

/**
 * 结果展示组件
 * 展示生成的图片，支持下载、分享功能
 */
export function ResultDisplay({
  generatedUrl,
  duration,
  onRegenerate,
  isGenerating = false,
}: ResultDisplayProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 下载图片
  const handleDownload = useCallback(async () => {
    try {
      // 如果是 base64 或 blob URL，直接下载
      if (generatedUrl.startsWith("data:") || generatedUrl.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = generatedUrl;
        link.download = `anime-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 远程 URL，通过 fetch 下载
        const response = await fetch(generatedUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `anime-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error("下载失败:", error);
    }
  }, [generatedUrl]);

  // 分享图片（Web Share API）
  const handleShare = useCallback(async () => {
    if (!navigator.share) {
      // 不支持 Web Share API，复制链接
      await navigator.clipboard.writeText(generatedUrl);
      return;
    }

    try {
      // 如果是 base64，转换为 blob
      let blob: Blob;
      if (generatedUrl.startsWith("data:")) {
        const response = await fetch(generatedUrl);
        blob = await response.blob();
      } else {
        const response = await fetch(generatedUrl);
        blob = await response.blob();
      }

      const file = new File([blob], "anime-art.png", { type: "image/png" });

      await navigator.share({
        title: "我的二次元作品",
        text: "看看 AI 帮我生成的二次元风格图片！",
        files: [file],
      });
    } catch (error) {
      // 用户取消分享或不支持文件分享
      console.log("分享取消或不支持:", error);
    }
  }, [generatedUrl]);

  // 格式化耗时
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-4">
      {/* 耗时提示 */}
      {duration && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <span>✨ 生成完成</span>
          <span>·</span>
          <span>耗时 {formatDuration(duration)}</span>
        </div>
      )}

      {/* 生成结果图片 */}
      <div className="relative w-full rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={generatedUrl}
          alt="生成结果"
          className="w-full h-auto max-h-[500px] object-contain"
          draggable={false}
        />
        {/* 标签 */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg text-xs text-white font-medium shadow-lg">
          ✨ AI 生成
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-center gap-3">
        {/* 重新生成 */}
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50
                       border border-slate-600 rounded-xl text-slate-300 text-sm
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "生成中..." : "重新生成"}
          </button>
        )}

        {/* 下载 */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-pink-500
                     hover:from-violet-600 hover:to-pink-600 rounded-xl text-white text-sm
                     font-medium transition-all shadow-lg"
        >
          {downloadSuccess ? (
            <>
              <Check className="h-4 w-4" />
              已下载
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              下载图片
            </>
          )}
        </button>

        {/* 分享 */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50
                     border border-slate-600 rounded-xl text-slate-300 text-sm transition-all"
        >
          <Share2 className="h-4 w-4" />
          分享
        </button>
      </div>

      {/* 移动端长按提示 */}
      <p className="text-center text-xs text-slate-500 md:hidden">
        💡 也可以长按图片直接保存到相册
      </p>
    </div>
  );
}
