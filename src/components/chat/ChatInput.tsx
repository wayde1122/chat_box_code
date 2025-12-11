"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmilePlus, Send } from "lucide-react";

export function ChatInput({ onSend }: { onSend: (q: string) => void }) {
  const [value, setValue] = React.useState("");

  const submit = () => {
    const q = value.trim();
    if (!q) return;
    onSend(q);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-900 p-3">
      <Button variant="ghost" title="插入表情" onClick={() => setValue((v) => v + " 😊")}> 
        <SmilePlus className="h-5 w-5" />
      </Button>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="请输入问题…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button onClick={submit} aria-label="发送">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

