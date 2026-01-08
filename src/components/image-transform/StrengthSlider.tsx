"use client";

import React from "react";
import { Wand2 } from "lucide-react";
import { MIN_STRENGTH, MAX_STRENGTH } from "@/services/imageTransform/stylePrompts";

interface StrengthSliderProps {
  /** 当前强度值 */
  value: number;
  /** 值变化回调 */
  onChange: (value: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 风格强度滑块组件
 */
export function StrengthSlider({
  value,
  onChange,
  disabled = false,
}: StrengthSliderProps) {
  const percentage = ((value - MIN_STRENGTH) / (MAX_STRENGTH - MIN_STRENGTH)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // 获取强度描述
  const getStrengthLabel = (val: number): string => {
    if (val <= 0.4) return "轻微";
    if (val <= 0.6) return "适中";
    if (val <= 0.8) return "较强";
    return "极强";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Wand2 className="h-4 w-4 text-violet-400" />
          风格强度
        </label>
        <span className="text-sm text-slate-400">
          {getStrengthLabel(value)} ({Math.round(value * 100)}%)
        </span>
      </div>

      <div className="relative">
        {/* 滑块轨道背景 */}
        <div className="absolute inset-y-0 left-0 right-0 my-auto h-2 bg-slate-700 rounded-full" />

        {/* 滑块已选择部分 */}
        <div
          className="absolute inset-y-0 left-0 my-auto h-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />

        {/* 原生滑块 */}
        <input
          type="range"
          min={MIN_STRENGTH}
          max={MAX_STRENGTH}
          step={0.1}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="
            relative w-full h-6 appearance-none bg-transparent cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
      </div>

      {/* 提示说明 */}
      <p className="text-xs text-slate-500">
        强度越高，风格转换效果越明显，原图特征保留越少
      </p>
    </div>
  );
}
