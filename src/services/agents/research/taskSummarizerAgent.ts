/**
 * TaskSummarizer Agent
 * 负责总结单个任务的搜索结果
 */

import { BaseAgent } from "../baseAgent";
import { llmService } from "../../llmService";
import { TASK_SUMMARIZER_SYSTEM_PROMPT } from "./prompts";
import type {
  TaskSummarizerInput,
  TaskSummarizerOutput,
  SourceItem,
} from "@/types/research";

/** 最大摘要长度（字符数） - 避免超出模型上下文 */
const MAX_SNIPPET_LENGTH = 500;

/** 最大来源数量 */
const MAX_SOURCES = 5;

/**
 * 截断文本到指定长度
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * 格式化搜索结果为提示文本
 */
function formatSearchResults(sources: SourceItem[]): string {
  // 限制来源数量并截断摘要
  const limitedSources = sources.slice(0, MAX_SOURCES);

  return limitedSources
    .map((source, index) => {
      const snippet = truncateText(source.snippet, MAX_SNIPPET_LENGTH);
      return `### 来源 ${index + 1}: ${source.title}
URL: ${source.url}
摘要: ${snippet}`;
    })
    .join("\n\n");
}

export class TaskSummarizerAgent extends BaseAgent<
  TaskSummarizerInput,
  TaskSummarizerOutput
> {
  readonly name = "TaskSummarizerAgent";
  readonly description = "总结单个研究任务的搜索结果";

  protected async run(input: TaskSummarizerInput): Promise<TaskSummarizerOutput> {
    const { task, searchResults } = input;

    // 检查搜索结果
    if (searchResults.length === 0) {
      return {
        summary: `### ${task.title}\n\n未找到相关搜索结果。建议尝试调整搜索关键词或使用其他搜索引擎。`,
      };
    }

    const formattedResults = formatSearchResults(searchResults);

    const prompt = `## 任务信息
- 标题: ${task.title}
- 意图: ${task.intent}
- 查询词: ${task.query}

## 搜索结果
${formattedResults}

请根据以上搜索结果，为这个任务生成总结。`;

    console.log(`[${this.name}] 正在总结任务: ${task.title}`);
    const summary = await llmService.generate(prompt, TASK_SUMMARIZER_SYSTEM_PROMPT);

    // 确保总结不为空
    if (!summary.trim()) {
      return {
        summary: `### ${task.title}\n\n无法生成总结，请稍后重试。`,
      };
    }

    return { summary };
  }
}

// 导出单例
export const taskSummarizerAgent = new TaskSummarizerAgent();
