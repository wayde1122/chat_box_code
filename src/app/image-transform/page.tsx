"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, RotateCcw, AlertCircle } from "lucide-react";
import { useImageTransform } from "@/hooks/useImageTransform";
import {
  ImageUploader,
  StyleSelector,
  StrengthSlider,
  ResultDisplay,
  GenerateButton,
} from "@/components/image-transform";

/**
 * 图片转二次元助手页面
 */
export default function ImageTransformPage() {
  const transform = useImageTransform();

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-100">
                  二次元转换助手
                </h1>
              </div>
            </div>

            {/* 右侧 - 操作按钮 */}
            <div className="flex items-center gap-2">
              {transform.status !== "idle" && (
                <button
                  onClick={transform.reset}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400
                             hover:text-slate-200 bg-slate-800/50 rounded-lg border
                             border-slate-700 hover:border-slate-600 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  重新开始
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="space-y-6">
          {/* 错误提示 */}
          {transform.error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{transform.error.message}</p>
              <button
                onClick={transform.clearError}
                className="ml-auto text-sm text-red-400 hover:text-red-300 underline"
              >
                关闭
              </button>
            </div>
          )}

          {/* 步骤 1: 上传图片 */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm font-semibold flex items-center justify-center">
                1
              </span>
              <h2 className="text-slate-200 font-medium">上传图片</h2>
            </div>
            <ImageUploader
              onUpload={transform.handleUpload}
              onRemove={transform.removeImage}
              previewUrl={transform.originalImage?.previewUrl ?? null}
              imageInfo={transform.originalImage}
              disabled={transform.status === "generating"}
            />
          </section>

          {/* 步骤 2: 选择风格 */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm font-semibold flex items-center justify-center">
                2
              </span>
              <h2 className="text-slate-200 font-medium">选择风格</h2>
            </div>
            <StyleSelector
              selectedStyle={transform.selectedStyle}
              onSelect={transform.setSelectedStyle}
              disabled={transform.status === "generating"}
            />
          </section>

          {/* 步骤 3: 调整强度 */}
          <section className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm font-semibold flex items-center justify-center">
                3
              </span>
              <h2 className="text-slate-200 font-medium">调整参数</h2>
            </div>
            <StrengthSlider
              value={transform.strength}
              onChange={transform.setStrength}
              disabled={transform.status === "generating"}
            />
          </section>

          {/* 生成按钮 */}
          <GenerateButton
            onClick={transform.handleGenerate}
            disabled={transform.status === "generating"}
            loading={transform.status === "generating"}
            canGenerate={transform.canGenerate}
          />

          {/* 生成中状态 */}
          {transform.status === "generating" && (
            <section className="glass rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
              <p className="text-slate-300 font-medium">正在施展魔法... ✨</p>
              <p className="text-slate-500 text-sm mt-2">预计需要 5-8 秒，请稍候</p>
            </section>
          )}

          {/* 结果展示 */}
          {transform.status === "completed" && transform.generatedImageUrl && (
            <section className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <h2 className="text-slate-200 font-medium">转换结果</h2>
              </div>
              <ResultDisplay
                generatedUrl={transform.generatedImageUrl}
                duration={transform.duration}
                onRegenerate={transform.handleGenerate}
                isGenerating={false}
              />
            </section>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="py-3 text-center text-sm text-slate-600 border-t border-slate-800 flex-shrink-0 hidden md:block">
        <p>
          由 Seedream 4.5 驱动 · 一键将照片转换为精美二次元风格
        </p>
      </footer>
    </div>
  );
}
