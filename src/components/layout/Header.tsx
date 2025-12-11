"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun, HelpCircle } from "lucide-react";
import React from "react";

export function Header() {
  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-700 bg-slate-900 px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-slate-100">FAQ 智能助手</span>
        <span className="text-sm text-slate-400">专业且友好，支持表情符号 🤖✨</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          aria-label="帮助"
          title="帮助"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => setDark((v) => !v)}
          aria-label="切换主题"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}

