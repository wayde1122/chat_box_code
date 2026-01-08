"use client";

import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { SnakeGame } from "@/components/games/SnakeGame";

/**
 * 贪吃蛇游戏页面
 */
export default function SnakePage() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* 顶部导航 */}
      <header className="glass border-b border-slate-700/50 flex-shrink-0">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧 - 返回和标题 */}
            <div className="flex items-center gap-4">
              <Link
                href="/games"
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200
                           transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">返回游戏列表</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-100">
                  贪吃蛇
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <SnakeGame />
      </main>

      {/* 页脚 */}
      <footer className="py-4 text-center text-sm text-slate-600 border-t border-slate-800 flex-shrink-0">
        <p>
          经典贪吃蛇游戏 · 吃掉食物不断变长
        </p>
      </footer>
    </div>
  );
}
