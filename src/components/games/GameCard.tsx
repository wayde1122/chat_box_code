"use client";

import Link from "next/link";
import { Snail, Grid2X2, Puzzle, Zap, Target, Dice6, ArrowRight, Clock } from "lucide-react";
import type { Game } from "@/types/games";

/**
 * 游戏图标映射
 * 使用 lucide-react 图标库
 */
const iconMap = {
  Snake: Snail, // 用蜗牛图标代替蛇（lucide 没有蛇图标）
  Grid2X2,
  Puzzle,
  Zap,
  Target,
  Dice6,
} as const;

interface GameCardProps {
  game: Game;
}

/**
 * 游戏卡片组件
 * 展示游戏信息，支持 available/coming-soon 两种状态
 */
export function GameCard({ game }: GameCardProps) {
  const Icon = iconMap[game.icon];

  // 可用状态 - 可点击进入游戏
  if (game.status === "available") {
    return (
      <Link
        href={`/games/${game.id}`}
        className="group relative block overflow-hidden rounded-xl p-[1px] transition-transform duration-300 hover:scale-[1.02]"
      >
        {/* 边框渐变 */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-75 transition-opacity duration-300 group-hover:opacity-100`}
        />

        {/* 卡片内容 */}
        <div className="relative flex h-full flex-col rounded-xl bg-slate-900/95 p-5 backdrop-blur-sm">
          {/* 图标 */}
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${game.gradient} shadow-lg`}
          >
            <Icon className="h-7 w-7 text-white" strokeWidth={1.5} />
          </div>

          {/* 文字区域 */}
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">{game.name}</h3>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              可玩
            </span>
          </div>
          <p className="mb-4 flex-1 text-sm text-slate-400">{game.description}</p>

          {/* 底部箭头 */}
          <div className="flex items-center gap-1 text-sm text-slate-500 transition-colors group-hover:text-rose-400">
            <span>开始游戏</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  }

  // Coming soon 状态 - 不可点击
  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-800/50 p-[1px] backdrop-blur-sm">
      {/* 边框 */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-50" />

      {/* 卡片内容 */}
      <div className="relative flex h-full flex-col rounded-xl bg-slate-900/80 p-5">
        {/* 图标 */}
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${game.gradient} opacity-50`}
        >
          <Icon className="h-7 w-7 text-white/80" strokeWidth={1.5} />
        </div>

        {/* 文字 */}
        <h3 className="mb-2 text-lg font-semibold text-slate-300">{game.name}</h3>
        <p className="mb-4 flex-1 text-sm text-slate-500">{game.description}</p>

        {/* 状态标签 */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          <span>即将上线</span>
        </div>
      </div>
    </div>
  );
}
