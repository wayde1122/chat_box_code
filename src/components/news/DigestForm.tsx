"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";

/** 热门话题示例 */
const EXAMPLE_TOPICS = [
  "Technology",
  "AI",
  "Business",
  "Sports",
  "Entertainment",
  "Science",
];

interface DigestFormProps {
  /** 提交回调 */
  onSubmit: (topic: string) => void;
  /** 是否正在生成中 */
  isGenerating: boolean;
}

export function DigestForm({ onSubmit, isGenerating }: DigestFormProps) {
  const [topic, setTopic] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (trimmedTopic && !isGenerating) {
      onSubmit(trimmedTopic);
    }
  };

  const handleExampleClick = (example: string) => {
    setTopic(example);
  };

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
            placeholder="输入话题关键词，例如：人工智能、大语言模型、开源项目"
            disabled={isGenerating}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl
                       text-slate-100 placeholder-slate-500 focus:border-amber-500
                       focus:ring-2 focus:ring-amber-500/20 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 开始按钮 */}
        <button
          type="submit"
          disabled={!topic.trim() || isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white
                     font-medium rounded-xl flex items-center gap-2 hover:opacity-90
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     btn-glow"
        >
          <Sparkles className="h-5 w-5" />
          {isGenerating ? "生成中..." : "生成日报"}
        </button>
      </div>

      {/* 热门话题 */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500">热门话题：</span>
        {EXAMPLE_TOPICS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            disabled={isGenerating}
            className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-400 border border-slate-700
                       rounded-lg hover:text-slate-200 hover:border-amber-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  );
}
