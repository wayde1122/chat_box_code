"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Newspaper, Settings, RotateCcw } from "lucide-react";
import { useNewsDigest } from "@/hooks/useNewsDigest";
import {
  DigestForm,
  DigestPanel,
  ProgressBar,
} from "@/components/news";

/**
 * 每日热点助手页面
 * 使用 Google News Trends MCP 获取国际新闻
 */
export default function NewsPage() {
  const news = useNewsDigest();

  // 重试当前生成
  const handleRetry = React.useCallback(() => {
    if (news.topic) {
      news.generateDigest(news.topic);
    }
  }, [news]);

  return (
    <div className="h-screen gradient-bg flex flex-col overflow-hidden">
      {/* 顶部导航 */}
      <header className="glass border-b border-slate-700/50 flex-shrink-0">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧 - 返回和标题 */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200
                           transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">返回首页</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-100">
                  每日热点助手
                </h1>
              </div>
            </div>

            {/* 右侧 - 操作按钮 */}
            <div className="flex items-center gap-2">
              {news.status !== "idle" && (
                <button
                  onClick={news.reset}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400
                             hover:text-slate-200 bg-slate-800/50 rounded-lg border
                             border-slate-700 hover:border-slate-600 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  新日报
                </button>
              )}
              <button
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                title="设置"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 填满剩余空间 */}
      <main className="flex-1 min-h-0 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6 h-full">
          {/* 输入表单 */}
          <section className="glass rounded-xl p-6 flex-shrink-0">
            <DigestForm
              onSubmit={news.generateDigest}
              isGenerating={news.isGenerating}
            />
          </section>

          {/* 进度条 */}
          {news.status !== "idle" && (
            <div className="flex-shrink-0">
              <ProgressBar
                progress={news.progress}
                progressText={news.progressText}
                status={news.status}
                error={news.error}
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* 日报展示区域 - 填满剩余空间 */}
          <section className="glass rounded-xl p-6 flex-1 min-h-0 overflow-hidden flex flex-col">
            <DigestPanel
              digest={news.digest}
              topic={news.topic}
              status={news.status}
            />
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="py-3 text-center text-sm text-slate-600 border-t border-slate-800 flex-shrink-0">
        <p>
          由 AI 热点助手驱动 · 自动获取、筛选、生成日报
        </p>
      </footer>
    </div>
  );
}
