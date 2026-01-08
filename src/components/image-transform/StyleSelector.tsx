"use client";

import React from "react";
import { Sparkles, Mountain, Grid3X3, Zap } from "lucide-react";
import type { StyleType, StyleConfig, StyleIconType } from "@/types/imageTransform";
import { getStyleList } from "@/services/imageTransform/stylePrompts";

/** 图标映射 */
const ICON_MAP: Record<StyleIconType, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Mountain,
  Grid3X3,
  Zap,
};

interface StyleSelectorProps {
  /** 当前选中的风格 */
  selectedStyle: StyleType | null;
  /** 选择风格回调 */
  onSelect: (style: StyleType) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 风格选择组件
 * 响应式设计：移动端横向滚动，桌面端网格布局
 */
export function StyleSelector({
  selectedStyle,
  onSelect,
  disabled = false,
}: StyleSelectorProps) {
  const styles = getStyleList();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        选择风格
      </label>

      {/* 风格卡片容器 - 移动端横向滚动，桌面端 2x2 网格 */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible scrollbar-hide">
        {styles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={selectedStyle === style.id}
            onSelect={() => !disabled && onSelect(style.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface StyleCardProps {
  style: StyleConfig;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

function StyleCard({ style, isSelected, onSelect, disabled }: StyleCardProps) {
  const Icon = ICON_MAP[style.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        flex-shrink-0 w-[140px] md:w-auto snap-start
        flex flex-col items-center p-4 rounded-xl border-2
        transition-all duration-200 touch-manipulation
        ${isSelected
          ? `bg-gradient-to-br ${style.gradient} border-transparent shadow-lg scale-[1.02]`
          : "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* 图标 */}
      <div className={`
        p-3 rounded-full mb-3 transition-colors
        ${isSelected ? "bg-white/20" : "bg-slate-700/50"}
      `}>
        <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-slate-400"}`} />
      </div>

      {/* 风格名称 */}
      <span className={`
        font-semibold mb-1 transition-colors
        ${isSelected ? "text-white" : "text-slate-200"}
      `}>
        {style.name}
      </span>

      {/* 风格描述 */}
      <span className={`
        text-xs text-center leading-relaxed transition-colors
        ${isSelected ? "text-white/80" : "text-slate-500"}
      `}>
        {style.description}
      </span>
    </button>
  );
}
