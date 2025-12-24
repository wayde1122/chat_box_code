"use client";
import React from "react";
import type { ChatMessage } from "@/types/chat";
import { MessageItem } from "./MessageItem";
import { Plane, Cloud, MapPin } from "lucide-react";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((m) => <MessageItem key={m.id} msg={m} />)
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      {/* 装饰图标 */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center glow-primary">
          <Plane className="w-12 h-12 text-violet-400" />
        </div>
        {/* 浮动图标 */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center animate-bounce">
          <Cloud className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="absolute -bottom-1 -left-3 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center animate-bounce" style={{ animationDelay: "0.2s" }}>
          <MapPin className="w-4 h-4 text-pink-400" />
        </div>
      </div>

      {/* 欢迎文字 */}
      <h2 className="text-2xl font-bold gradient-text mb-3">
        欢迎使用智能旅行助手
      </h2>
      <p className="text-slate-400 mb-6 max-w-md">
        我可以帮您查询天气、推荐景点，为您的旅行提供智能规划建议
      </p>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <FeatureCard
          icon={Cloud}
          title="实时天气"
          description="查询全球任意城市的实时天气"
          color="cyan"
        />
        <FeatureCard
          icon={MapPin}
          title="景点推荐"
          description="根据天气推荐最适合的景点"
          color="pink"
        />
        <FeatureCard
          icon={Plane}
          title="智能规划"
          description="AI 分析为您提供旅行建议"
          color="violet"
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: "cyan" | "pink" | "violet";
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    pink: "from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-400",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
  };

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-b ${colorClasses[color]} border backdrop-blur-sm`}
    >
      <Icon className={`w-6 h-6 mb-2 ${colorClasses[color].split(" ").pop()}`} />
      <h3 className="font-medium text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}
