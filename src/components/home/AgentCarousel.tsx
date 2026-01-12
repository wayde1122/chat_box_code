"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plane,
  Code,
  Pencil,
  BarChart3,
  Bot,
  Newspaper,
  Gamepad2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Agent } from "@/data/agents";

const iconMap = {
  Plane,
  Code,
  Pencil,
  BarChart3,
  Bot,
  Newspaper,
  Gamepad2,
  Sparkles,
} as const;

interface AgentCarouselProps {
  agents: readonly Agent[];
}

export function AgentCarousel({ agents }: AgentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  // 累计旋转角度，用于实现最短路径旋转
  const [rotation, setRotation] = useState(0);

  const itemCount = agents.length;
  // 根据卡片数量动态计算半径
  const radius = itemCount <= 3 ? 320 : itemCount <= 5 ? 380 : 440;
  const anglePerItem = 360 / itemCount;

  const goToNext = useCallback(() => {
    const next = (currentIndex + 1) % itemCount;
    setCurrentIndex(next);
    // 始终向右旋转一格
    setRotation((r) => r - anglePerItem);
  }, [currentIndex, itemCount, anglePerItem]);

  const goToPrev = useCallback(() => {
    const next = (currentIndex - 1 + itemCount) % itemCount;
    setCurrentIndex(next);
    // 始终向左旋转一格
    setRotation((r) => r + anglePerItem);
  }, [currentIndex, itemCount, anglePerItem]);

  const goToIndex = useCallback((index: number) => {
    const diff = index - currentIndex;
    setCurrentIndex(index);
    setRotation((r) => r - diff * anglePerItem);
  }, [currentIndex, anglePerItem]);

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || isHovering) return;

    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovering, goToNext]);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div
      className="relative mx-auto w-full max-w-6xl pt-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 3D 旋转容器 */}
      <div
        className="relative mx-auto h-[200px] w-full"
        style={{ 
          perspective: "1200px",
          perspectiveOrigin: "center 60%"
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[180px] w-[220px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {agents.map((agent, index) => {
            const angle = (360 / itemCount) * index;
            const Icon = iconMap[agent.icon];

            return (
              <div
                key={agent.id}
                className="absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                }}
              >
                <CarouselCard
                  agent={agent}
                  Icon={Icon}
                  isActive={index === currentIndex}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 导航按钮 */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-800/80 p-2 text-slate-300 backdrop-blur-sm transition-all hover:bg-violet-600 hover:text-white hover:scale-110"
        aria-label="上一个"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-slate-800/80 p-2 text-slate-300 backdrop-blur-sm transition-all hover:bg-violet-600 hover:text-white hover:scale-110"
        aria-label="下一个"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* 指示器 */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {agents.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-violet-500"
                : "w-2 bg-slate-600 hover:bg-slate-500"
            }`}
            aria-label={`跳转到第 ${index + 1} 个`}
          />
        ))}
      </div>

      {/* 自动播放控制 */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`text-xs transition-colors ${
            isAutoPlaying ? "text-violet-400" : "text-slate-500"
          }`}
        >
          {isAutoPlaying ? "● 自动播放中" : "○ 已暂停"}
        </button>
      </div>
    </div>
  );
}

function CarouselCard({
  agent,
  Icon,
  isActive,
}: {
  agent: Agent;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive: boolean;
}) {
  return (
    <Link
      href={agent.href}
      className={`group relative block overflow-hidden rounded-xl bg-slate-800/50 p-[1px] backdrop-blur-sm transition-all duration-500 ${
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-60"
      }`}
      style={{ transformStyle: "flat" }}
    >
      {/* 边框 */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-50" />
      
      {/* 卡片内容 */}
      <div className="relative flex flex-col rounded-xl bg-slate-900/80 p-4">
        {/* 图标 */}
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${agent.gradient} opacity-50`}>
          <Icon className="h-5 w-5 text-white/80" strokeWidth={1.5} />
        </div>

        {/* 文字 */}
        <h3 className="mb-1 text-sm font-semibold text-slate-300">{agent.name}</h3>
        <p className="mb-3 flex-1 text-xs text-slate-500 line-clamp-2">{agent.description}</p>

        {/* 状态标签 */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowRight className="h-3 w-3" />
          <span>立即体验</span>
        </div>
      </div>
    </Link>
  );
}
