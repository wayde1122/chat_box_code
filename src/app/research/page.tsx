"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Settings, RotateCcw } from "lucide-react";
import { useResearch } from "@/hooks/useResearch";
import {
  ResearchForm,
  TodoListPanel,
  ReportPanel,
  ProgressBar,
} from "@/components/research";

/**
 * 深度研究助手页面
 */
export default function ResearchPage() {
  const research = useResearch();

  // 重试当前研究
  const handleRetry = React.useCallback(() => {
    if (research.topic) {
      research.startResearch(research.topic, "tavily");
    }
  }, [research]);

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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-100">
                  深度研究助手
                </h1>
              </div>
            </div>

            {/* 右侧 - 操作按钮 */}
            <div className="flex items-center gap-2">
              {research.status !== "idle" && (
                <button
                  onClick={research.reset}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400
                             hover:text-slate-200 bg-slate-800/50 rounded-lg border
                             border-slate-700 hover:border-slate-600 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  新研究
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
      <main className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6 h-full">
          {/* 输入表单 - overflow-visible 确保下拉菜单不被裁剪 */}
          <section className="glass rounded-xl p-6 flex-shrink-0 overflow-visible relative z-20">
            <ResearchForm
              onSubmit={research.startResearch}
              isResearching={research.isResearching}
            />
          </section>

          {/* 进度条 */}
          <div className="flex-shrink-0">
            <ProgressBar
              progress={research.progress}
              progressText={research.progressText}
              status={research.status}
              error={research.error}
              onRetry={handleRetry}
            />
          </div>

          {/* 主面板区域 - 填满剩余空间 */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧 - 任务列表 */}
            <section className="glass rounded-xl p-4 lg:col-span-1 overflow-y-auto">
              <TodoListPanel
                todoList={research.todoList}
              />
            </section>

            {/* 右侧 - 报告面板 */}
            <section className="glass rounded-xl p-4 lg:col-span-2 overflow-hidden flex flex-col min-h-0">
              <ReportPanel
                report={research.report}
                topic={research.topic}
                status={research.status}
              />
            </section>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="py-3 text-center text-sm text-slate-600 border-t border-slate-800 flex-shrink-0">
        <p>
          由 AI 研究助手驱动 · 自动搜索、分析、生成报告
        </p>
      </footer>
    </div>
  );
}
