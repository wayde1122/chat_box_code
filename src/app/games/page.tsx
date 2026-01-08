"use client";

import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { games } from "@/data/games";
import { GameCard } from "@/components/games/GameCard";

/**
 * 游戏助手页面
 * 展示可玩的 H5 小游戏列表
 */
export default function GamesPage() {
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-100">
                  游戏助手
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题区域 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            经典小游戏合集
          </h2>
          <p className="text-slate-400">
            休闲娱乐好帮手，点击卡片开始游戏
          </p>
        </div>

        {/* 游戏卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* 空状态提示 */}
        {games.length === 0 && (
          <div className="text-center py-16">
            <Gamepad2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">暂无游戏，敬请期待...</p>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="py-4 text-center text-sm text-slate-600 border-t border-slate-800 flex-shrink-0">
        <p>
          经典小游戏合集 · 休闲娱乐好帮手
        </p>
      </footer>
    </div>
  );
}
