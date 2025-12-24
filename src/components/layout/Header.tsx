"use client";
import { Button } from "@/components/ui/button";
import { Plane, Sparkles, Github } from "lucide-react";

export function Header() {
  return (
    <header className="glass flex h-16 items-center justify-between border-b border-violet-500/20 px-6">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 glow-primary">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">智能旅行助手</h1>
            <p className="text-xs text-slate-400">AI Travel Agent</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* 功能标签 */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="h-3 w-3" />
            天气查询
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-3 w-3" />
            景点推荐
          </span>
        </div>

        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white"
          aria-label="GitHub"
          onClick={() => window.open("https://github.com", "_blank")}
        >
          <Github className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
