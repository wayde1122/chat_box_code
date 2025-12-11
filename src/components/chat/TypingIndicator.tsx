import React from "react";

export function TypingIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="px-4 pb-2 text-xs text-slate-400">助手正在输入… ⌛</div>
  );
}

