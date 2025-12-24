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
        className="group relative block overflow-hidden rounded-2xl p-[1px] transition-transform duration-300 hover:scale-[1.02]"
      >
        {/* 边框渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-75 transition-opacity duration-300 group-hover:opacity-100`} />
        
        {/* 卡片内容 */}
        <div className="relative flex items-center gap-5 rounded-2xl bg-slate-900/95 p-5 backdrop-blur-sm">
          {/* 图标区域 */}
          <div className="flex-shrink-0">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${agent.gradient} shadow-lg shadow-violet-500/25`}>
              <Icon className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* 文字区域 */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{agent.name}</h3>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                可用
              </span>
            </div>
            <p className="text-sm text-slate-400 truncate">{agent.description}</p>
          </div>

          {/* 箭头 */}
          <div className="flex-shrink-0">
            <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
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
