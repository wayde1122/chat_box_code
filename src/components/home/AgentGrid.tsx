"use client";

import { agents } from "@/data/agents";
import { AgentCard } from "./AgentCard";
import { Rocket, Clock } from "lucide-react";

export function AgentGrid() {
  const featuredAgents = agents.filter((agent) => agent.status === "available");
  const comingSoonAgents = agents.filter((agent) => agent.status === "coming-soon");

  return (
    <section className="relative mx-auto max-w-5xl px-6">
      {/* 主推 Agent 标题 */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <Rocket className="h-4 w-4 text-violet-400" />
        <h2 className="text-sm font-medium text-slate-300">立即体验</h2>
      </div>

      {/* 主推 Agent */}
      <div className="mb-6">
        {featuredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} featured />
        ))}
      </div>

      {/* 敬请期待区域 */}
      {comingSoonAgents.length > 0 && (
        <div className="relative">
          {/* 分隔线 */}
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          {/* 标题 */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-500">
              更多助手即将推出
            </h2>
          </div>

          {/* 卡片网格 */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoonAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
