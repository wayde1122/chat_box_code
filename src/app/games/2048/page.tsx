"use client";

import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { Game2048 } from "@/components/games/Game2048";

/**
 * 2048游戏页面
 */
export default function Game2048Page() {
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-100">
                  2048
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Game2048 />
      </main>

      {/* 页脚 */}
      <footer className="py-4 text-center text-sm text-slate-600 border-t border-slate-800 flex-shrink-0">
        <p>
          2048数字合并游戏 · 滑动方块合成 2048
        </p>
      </footer>
    </div>
  );
}
