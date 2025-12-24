"use client";

import { Bot, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative px-6 pb-6">
      <div className="mx-auto max-w-4xl text-center">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="relative">
            {/* 外层光晕动画 */}
            <div className="absolute -inset-3 animate-pulse rounded-2xl bg-gradient-to-r from-violet-500/50 to-cyan-500/50 blur-xl" />
            {/* 内层光晕 */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 opacity-75 blur-md" />
            {/* 图标容器 */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-2xl shadow-violet-500/30">
              <Bot className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* 标题 */}
        <div className="mb-3">
          <h1 className="inline-flex items-center justify-center gap-2 text-4xl font-bold leading-normal sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text pb-1 text-transparent">
              AI Agent
            </span>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text pb-1 text-transparent">
              Hub
            </span>
          </h1>
        </div>

        {/* 副标题 */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <p className="text-lg text-slate-300 sm:text-xl">
            您的智能助手，触手可及
          </p>
          <Sparkles className="h-4 w-4 text-amber-400" />
        </div>

        {/* 描述 */}
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400">
          探索多种 AI Agent，为您的工作与生活提供智能化支持
        </p>
      </div>
    </section>
  );
}
