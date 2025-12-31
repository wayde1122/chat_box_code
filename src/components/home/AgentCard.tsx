"use client";

import Link from "next/link";
import { Plane, Code, Pencil, BarChart3, Bot, ArrowRight, Clock } from "lucide-react";
import type { Agent } from "@/data/agents";

const iconMap = {
  Plane,
  Code,
  Pencil,
  BarChart3,
  Bot,
} as const;

interface AgentCardProps {
  agent: Agent;
  featured?: boolean;
}

export function AgentCard({ agent, featured = false }: AgentCardProps) {
  const Icon = iconMap[agent.icon];

  if (featured) {
    return (
      <Link
        href={agent.href}
        className="group relative block overflow-hidden rounded-xl p-[1px] transition-transform duration-300 hover:scale-[1.02]"
      >
        {/* 边框渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-75 transition-opacity duration-300 group-hover:opacity-100`} />
        
        {/* 卡片内容 - 正方形布局 */}
        <div className="relative flex h-full flex-col rounded-xl bg-slate-900/95 p-4 backdrop-blur-sm">
          {/* 图标 */}
          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${agent.gradient} shadow-lg shadow-violet-500/25`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={1.5} />
          </div>

          {/* 文字区域 */}
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{agent.name}</h3>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
              可用
            </span>
          </div>
          <p className="mb-3 flex-1 text-sm text-slate-400 line-clamp-2">{agent.description}</p>

          {/* 底部箭头 */}
          <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-violet-400 transition-colors">
            <span>立即体验</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  }

  // 普通卡片（coming soon）
  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-800/50 p-[1px] backdrop-blur-sm">
      {/* 边框 */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-50" />
      
      {/* 卡片内容 */}
      <div className="relative flex h-full flex-col rounded-xl bg-slate-900/80 p-4">
        {/* 图标 */}
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${agent.gradient} opacity-50`}>
          <Icon className="h-5 w-5 text-white/80" strokeWidth={1.5} />
        </div>

        {/* 文字 */}
        <h3 className="mb-1 text-sm font-semibold text-slate-300">{agent.name}</h3>
        <p className="mb-3 flex-1 text-xs text-slate-500 line-clamp-2">{agent.description}</p>

        {/* 状态标签 */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          <span>敬请期待</span>
        </div>
      </div>
    </div>
  );
}
