"use client";

import React from "react";
import { Search, Sparkles, ChevronDown, Check } from "lucide-react";
import type { SearchBackend } from "@/types/research";

/** 搜索引擎选项 */
const SEARCH_BACKENDS: Array<{ value: SearchBackend; label: string; desc: string }> = [
  { value: "tavily", label: "Tavily", desc: "AI 专用搜索" },
  { value: "duckduckgo", label: "DuckDuckGo", desc: "免费隐私搜索" },
  { value: "serper", label: "Serper", desc: "Google 搜索" },
  { value: "bing", label: "Bing", desc: "微软搜索" },
];

/** 示例主题 */
const EXAMPLE_TOPICS = [
  "多模态大模型的最新进展",
  "2024 年 AI 发展趋势",
  "量子计算的商业应用",
  "碳中和技术路线",
];

interface ResearchFormProps {
  /** 提交回调 */
  onSubmit: (topic: string, searchBackend: SearchBackend) => void;
  /** 是否正在研究中 */
  isResearching: boolean;
}

export function ResearchForm({ onSubmit, isResearching }: ResearchFormProps) {
  const [topic, setTopic] = React.useState("");
  const [searchBackend, setSearchBackend] = React.useState<SearchBackend>("tavily");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (trimmedTopic && !isResearching) {
      onSubmit(trimmedTopic, searchBackend);
    }
  };

  const handleExampleClick = (example: string) => {
    setTopic(example);
  };

  const handleSelectBackend = (value: SearchBackend) => {
    setSearchBackend(value);
    setIsDropdownOpen(false);
  };

  // 点击外部关闭下拉框
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentBackend = SEARCH_BACKENDS.find((b) => b.value === searchBackend);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 主输入区域 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入研究主题，例如：人工智能在医疗领域的应用"
            disabled={isResearching}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl
                       text-slate-100 placeholder-slate-500 focus:border-violet-500
                       focus:ring-2 focus:ring-violet-500/20 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 搜索引擎下拉选择 */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !isResearching && setIsDropdownOpen(!isDropdownOpen)}
            disabled={isResearching}
            className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl
                       text-slate-100 hover:border-slate-600 transition-all min-w-[160px]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex-1 text-left">{currentBackend?.label}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* 下拉菜单 */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
              {SEARCH_BACKENDS.map((backend) => (
                <button
                  key={backend.value}
                  type="button"
                  onClick={() => handleSelectBackend(backend.value)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-700/50 transition-colors
                    ${searchBackend === backend.value ? "bg-violet-500/10" : ""}`}
                >
                  <div className="flex-1">
                    <div className="text-sm text-slate-200">{backend.label}</div>
                    <div className="text-xs text-slate-500">{backend.desc}</div>
                  </div>
                  {searchBackend === backend.value && (
                    <Check className="h-4 w-4 text-violet-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 开始按钮 */}
        <button
          type="submit"
          disabled={!topic.trim() || isResearching}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white
                     font-medium rounded-xl flex items-center gap-2 hover:opacity-90
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     btn-glow"
        >
          <Sparkles className="h-5 w-5" />
          {isResearching ? "研究中..." : "开始研究"}
        </button>
      </div>

      {/* 示例主题 */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500">热门话题：</span>
        {EXAMPLE_TOPICS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            disabled={isResearching}
            className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-400 border border-slate-700
                       rounded-lg hover:text-slate-200 hover:border-violet-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  );
}
