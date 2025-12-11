import React from "react";
import type { ChatMessage } from "@/types/chat";
import { MessageItem } from "./MessageItem";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div ref={ref} className="h-full overflow-y-auto space-y-3 p-4">
      {messages.length === 0 ? (
        <div className="mt-20 text-center text-slate-400">
          请输入问题开始对话吧～ ✨
        </div>
      ) : (
        messages.map((m) => <MessageItem key={m.id} msg={m} />)
      )}
    </div>
  );
}

