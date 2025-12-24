import faq from "@/data/faq.json";
import type { ChatRequestBody, ChatResponse } from "@/types/api";
import type { FAQData } from "@/types/faq";
import { runAgent } from "@/services/agentService";
import { NextResponse } from "next/server";

/**
 * 在 FAQ 数据中查找匹配的答案
 */
function findFAQAnswer(question: string, data: FAQData): string | null {
  const q = question.toLowerCase();
  const direct = data.items.find((it) => q.includes(it.question.toLowerCase()));
  if (direct) return direct.answer;
  const byKeyword = data.items.find((it) =>
    it.keywords.some((k) => q.includes(k.toLowerCase()))
  );
  return byKeyword?.answer ?? null;
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  const question = body.question?.trim();
  const model = body.model ?? "travel-agent"; // 默认使用 Agent 模式

  if (!question) {
    return NextResponse.json({ error: "缺少问题参数" }, { status: 400 });
  }

  // FAQ 匹配模式
  if (model === "faq-matcher") {
    const answer = findFAQAnswer(question, faq as FAQData);
    const resp: ChatResponse = {
      model,
      question,
      answer:
        answer ??
        "抱歉，我暂时无法回答这个问题。请尝试其他关键词，或联系客服支持。🤔",
    };
    return NextResponse.json(resp);
  }

  // 智能旅行助手 Agent 模式
  if (model === "travel-agent") {
    try {
      const agentResult = await runAgent(question);
      const resp: ChatResponse = {
        model: agentResult.model,
        question,
        answer: agentResult.answer,
        steps: agentResult.steps,
        usedTools: agentResult.usedTools,
      };
      return NextResponse.json(resp);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error("Agent 执行失败:", message);
      
      // Agent 失败时回退到 FAQ
      const faqAnswer = findFAQAnswer(question, faq as FAQData);
      const resp: ChatResponse = {
        model: "faq-fallback",
        question,
        answer:
          faqAnswer ??
          "抱歉，AI 助手暂时不可用，请稍后再试。🤔",
      };
      return NextResponse.json(resp);
    }
  }

  // 未知模型
  return NextResponse.json({ error: "未知的模型类型" }, { status: 400 });
}
