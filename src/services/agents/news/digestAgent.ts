/**
 * DigestWriter Agent
 * 负责将热点新闻整合为每日热点日报
 */

import { BaseAgent } from "../baseAgent";
import { llmService } from "../../llmService";
import { DIGEST_WRITER_SYSTEM_PROMPT } from "./prompts";
import type { DigestAgentInput, DigestAgentOutput } from "@/types/news";

/**
 * 获取当前日期的中文格式
 */
function getChineseDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
}

export class DigestWriterAgent extends BaseAgent<
  DigestAgentInput,
  DigestAgentOutput
> {
  readonly name = "DigestWriterAgent";
  readonly description = "将热点新闻整合为每日热点日报";

  protected async run(input: DigestAgentInput): Promise<DigestAgentOutput> {
    const { topic, hotNewsMarkdown } = input;
    const dateStr = getChineseDateString();

    // 检查是否有内容
    if (!hotNewsMarkdown || hotNewsMarkdown.trim().length === 0) {
      return {
        digest: `# AI日报 | ${dateStr} | by@wayde

## 📭 暂无相关内容

很抱歉，未能获取到与「${topic}」相关的热点内容。

可能的原因：
- 热点新闻服务暂时无法访问
- 当前时段没有相关新闻

建议：
- 尝试更换话题关键词
- 稍后重试

---
*本日报由 AI 热点助手自动生成*`,
      };
    }

    const prompt = `# 用户话题
${topic}

# 当前日期
${dateStr}

# 数据获取状态
✅ 热点新闻数据已成功获取

# 热点新闻原始数据
${hotNewsMarkdown}

请根据用户话题「${topic}」，从以上热点新闻中筛选出最相关、最有价值的内容，生成一份每日热点日报。

注意：
1. 日期使用 ${dateStr}
2. 只保留与话题相关的内容（如果话题是通用词如"热点"、"今日"则保留所有内容）
3. 为每条热点添加独特且贴切的 Emoji
4. 保留原始链接
5. 如果热点内容本身就很丰富，不需要额外描述
6. 按照平台分类整理
7. 如果热榜中没有与话题相关的内容，请明确说明"今日热榜中暂无与该话题相关的内容"，而不是说"数据获取失败"或"连接失败"`;

    console.log(`[${this.name}] 正在生成日报: ${topic}`);
    const digest = await llmService.generate(prompt, DIGEST_WRITER_SYSTEM_PROMPT);

    // 确保日报不为空
    if (!digest.trim()) {
      return {
        digest: `# AI日报 | ${dateStr} | by@wayde

## ⚠️ 生成失败

日报生成过程中出现问题，请稍后重试。

---
*本日报由 AI 热点助手自动生成*`,
      };
    }

    return { digest };
  }
}

// 导出单例
export const digestWriterAgent = new DigestWriterAgent();
