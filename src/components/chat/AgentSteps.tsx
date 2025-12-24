"use client";
import React from "react";
import type { AgentStep } from "@/types/agent";
import { ChevronDown, ChevronRight, Brain, Wrench, Eye } from "lucide-react";

interface AgentStepsProps {
  steps: AgentStep[];
}

export function AgentSteps({ steps }: AgentStepsProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (steps.length === 0) return null;

  return (
    <div className="mt-3 border-t border-slate-600/50 pt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-400 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <Brain className="h-3.5 w-3.5" />
        <span>查看思考过程 ({steps.length} 步)</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-800/60 p-2.5 text-xs border border-slate-700/50"
            >
              {/* 思考 */}
              {step.thought && (
                <div className="flex items-start gap-2 text-slate-300">
                  <Brain className="h-3.5 w-3.5 mt-0.5 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-purple-400 font-medium">思考：</span>
                    <span className="whitespace-pre-wrap">{step.thought}</span>
                  </div>
                </div>
              )}

              {/* 行动 */}
              {step.action && (
                <div className="flex items-start gap-2 mt-1.5 text-slate-300">
                  <Wrench className="h-3.5 w-3.5 mt-0.5 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-blue-400 font-medium">行动：</span>
                    <code className="text-emerald-400 bg-slate-900/50 px-1 rounded">
                      {step.action}
                    </code>
                  </div>
                </div>
              )}

              {/* 观察结果 */}
              {step.observation && (
                <div className="flex items-start gap-2 mt-1.5 text-slate-300">
                  <Eye className="h-3.5 w-3.5 mt-0.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-amber-400 font-medium">观察：</span>
                    <span className="whitespace-pre-wrap">{step.observation}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

