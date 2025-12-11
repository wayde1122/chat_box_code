import faq from "@/data/faq.json";
import type { ChatRequestBody, ChatResponse } from "@/types/api";
import type { FAQData } from "@/types/faq";
import { NextResponse } from "next/server";

function findFAQAnswer(question: string, data: FAQData) {
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
  const model = body.model || "faq-matcher";

  if (!question) {
    return NextResponse.json(
      { error: "缺少问题参数" },
      { status: 400 }
    );
  }

  const answer = findFAQAnswer(question, faq as FAQData);
  const resp: ChatResponse = {
    model,
    question,
    answer:
      answer ||
      "抱歉，我暂时无法回答这个问题。请尝试其他关键词，或联系客服支持。🤔",
  };

  return NextResponse.json(resp);
}

