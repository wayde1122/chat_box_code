import type { FAQData, FAQItem } from "@/types/faq";

export async function fetchFAQ(): Promise<FAQData> {
  const res = await fetch("/api/faq", { cache: "no-store" });
  if (!res.ok) throw new Error("加载FAQ失败");
  return (await res.json()) as FAQData;
}

export function matchFAQAnswer(question: string, faq: FAQData): FAQItem | null {
  const q = question.toLowerCase();
  const direct = faq.items.find((it) => q.includes(it.question.toLowerCase()));
  if (direct) return direct;
  const byKeyword = faq.items.find((it) =>
    it.keywords.some((k) => q.includes(k.toLowerCase()))
  );
  return byKeyword || null;
}

