"use client";

import { agents } from "@/data/agents";
import { AgentCard } from "./AgentCard";

export function AgentGrid() {
  const featuredAgents = agents.filter((agent) => agent.status === "available");
  const comingSoonAgents = agents.filter((agent) => agent.status === "coming-soon");

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      {/* 主推 Agent */}
      <div className="mb-12">
        {featuredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} featured />
        ))}
      </div>

      {/* 敬请期待区域 */}
      {comingSoonAgents.length > 0 && (
        <div>
          <h2 className="mb-6 text-center text-lg font-medium text-slate-500">
            更多助手即将推出
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoonAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

