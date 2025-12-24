"use client";
import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
  onClear?: () => void;
  onSelectExample?: (text: string) => void;
}

export function ChatLayout({ children, onClear, onSelectExample }: ChatLayoutProps) {
  return (
    <div className="flex min-h-screen gradient-bg text-slate-100">
      {/* 固定头部 */}
      <div className="fixed inset-x-0 top-0 z-20">
        <Header />
      </div>

      {/* 主内容区 */}
      <div className="pt-16 flex w-full">
        {/* 侧边栏 - 桌面端显示 */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 z-10">
          <Sidebar onClear={onClear} onSelectExample={onSelectExample} />
        </div>

        {/* 聊天区域 */}
        <main className="flex-1 lg:ml-72 h-[calc(100vh-4rem)] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
