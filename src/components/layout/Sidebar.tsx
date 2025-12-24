"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  MessageCircle,
  Cloud,
  MapPin,
  Lightbulb,
  Zap,
} from "lucide-react";

interface SidebarProps {
  onClear?: () => void;
  onSelectExample?: (text: string) => void;
}

const EXAMPLE_QUERIES = [
  { icon: Cloud, text: "北京今天天气怎么样？", color: "text-cyan-400" },
  { icon: MapPin, text: "上海明天天气适合去哪里玩？", color: "text-emerald-400" },
  { icon: Lightbulb, text: "杭州后天天气如何，推荐一些景点", color: "text-amber-400" },
  { icon: Zap, text: "深圳天气怎么样，有什么好玩的地方", color: "text-pink-400" },
];

export function Sidebar({ onClear, onSelectExample }: SidebarProps) {
  return (
    <aside className="h-full w-72 border-r border-violet-500/10 bg-slate-900/50 p-4 flex flex-col">
      {/* 新对话按钮 */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 mb-4"
        onClick={onClear}
      >
        <MessageCircle className="h-4 w-4" />
        新对话
      </Button>

      {/* 示例问题 */}
      <div className="flex-1">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-2">
          试试这些问题
        </h3>
        <div className="space-y-2">
          {EXAMPLE_QUERIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectExample?.(item.text)}
                className="w-full flex items-start gap-3 p-3 rounded-xl text-left text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors group"
              >
                <Icon className={`h-4 w-4 mt-0.5 ${item.color} shrink-0`} />
                <span className="line-clamp-2">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="pt-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
          onClick={onClear}
        >
          <Trash2 className="h-4 w-4" />
          清空聊天记录
        </Button>
      </div>

      {/* 功能说明 */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <h4 className="text-xs font-medium text-slate-400 mb-2">✨ 功能介绍</h4>
        <ul className="text-xs text-slate-500 space-y-1">
          <li>• 查询任意城市实时天气</li>
          <li>• 根据天气推荐旅游景点</li>
          <li>• 支持未来 3 天天气预报</li>
          <li>• AI 智能分析与规划</li>
        </ul>
      </div>
    </aside>
  );
}
