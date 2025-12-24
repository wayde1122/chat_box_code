"use client";

import { Bot } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 px-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 blur-xl opacity-50" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-2xl">
              <Bot className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
          AI Agent Hub
        </h1>

        {/* 副标题 */}
        <p className="mb-4 text-xl text-slate-400 sm:text-2xl">
          您的智能助手，触手可及
        </p>
        <p className="mx-auto max-w-2xl text-base text-slate-500">
          探索多种 AI Agent，为您的工作与生活提供智能化支持。从旅行规划到代码编写，我们让 AI 成为您的得力助手。
        </p>
      </div>
    </section>
  );
}

