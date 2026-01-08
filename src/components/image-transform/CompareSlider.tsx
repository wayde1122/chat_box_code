"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";

interface CompareSliderProps {
  /** 原图 URL */
  originalUrl: string;
  /** 生成图 URL */
  generatedUrl: string;
}

/**
 * 图片对比滑块组件
 * 左右拖拽查看原图与生成图的对比
 */
export function CompareSlider({ originalUrl, generatedUrl }: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.offsetWidth);
    };

    // 初始化宽度
    updateWidth();

    // 监听窗口大小变化
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  // 触摸事件支持
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 rounded-xl overflow-hidden cursor-ew-resize select-none touch-pan-y"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 生成图（底层，完整显示） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={generatedUrl}
        alt="生成结果"
        className="absolute inset-0 w-full h-full object-contain bg-slate-950"
        draggable={false}
      />

      {/* 原图（上层，裁剪显示） */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalUrl}
          alt="原图"
          className="absolute inset-0 w-full h-full object-contain bg-slate-900"
          style={{ width: containerWidth > 0 ? `${containerWidth}px` : "100%" }}
          draggable={false}
        />
      </div>

      {/* 分割线 */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        {/* 滑块手柄 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-slate-400 rounded-full" />
            <div className="w-0.5 h-4 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* 标签 */}
      <div className="absolute top-4 left-4 px-2 py-1 bg-slate-900/80 rounded text-xs text-slate-300">
        原图
      </div>
      <div className="absolute top-4 right-4 px-2 py-1 bg-violet-500/80 rounded text-xs text-white">
        生成
      </div>
    </div>
  );
}
