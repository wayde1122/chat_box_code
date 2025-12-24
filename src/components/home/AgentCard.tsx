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
  const isAvailable = agent.status === "available";

  if (featured) {
    return (
      <Link
        href={agent.href}
        className="group relative block overflow-hidden rounded-3xl p-[1px] transition-transform duration-300 hover:scale-[1.02]"
      >
        {/* 边框渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-r ${agent.gradient} opacity-75 transition-opacity duration-300 group-hover:opacity-100`} />
        
        {/* 卡片内容 */}
        <div className="relative flex flex-col gap-6 rounded-3xl bg-slate-900/95 p-8 backdrop-blur-sm sm:flex-row sm:items-center">
          {/* 图标区域 */}
          <div className="flex-shrink-0">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.gradient} shadow-lg shadow-violet-500/25`}>
              <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* 文字区域 */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-2xl font-bold text-white">{agent.name}</h3>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                可用
              </span>
            </div>
            <p className="mb-4 text-slate-400">{agent.description}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-violet-400 transition-colors group-hover:text-violet-300">
              <span>立即体验</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 普通卡片（coming soon）
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-slate-800/50 p-[1px] backdrop-blur-sm">
      {/* 边框 */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-50" />
      
      {/* 卡片内容 */}
      <div className="relative flex h-full flex-col rounded-2xl bg-slate-900/80 p-6">
        {/* 图标 */}
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${agent.gradient} opacity-50`}>
          <Icon className="h-7 w-7 text-white/80" strokeWidth={1.5} />
        </div>

        {/* 文字 */}
        <h3 className="mb-2 text-lg font-semibold text-slate-300">{agent.name}</h3>
        <p className="mb-4 flex-1 text-sm text-slate-500">{agent.description}</p>

        {/* 状态标签 */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <span>敬请期待</span>
        </div>
      </div>
    </div>
  );
}

