import type { ChatResponse } from "@/types/api";

export async function sendChat(question: string, model = "faq-matcher"): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, model }),
  });
  if (!res.ok) throw new Error("聊天接口请求失败");
  return (await res.json()) as ChatResponse;
}

