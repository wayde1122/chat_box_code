/**
 * ReportWriter Agent
 * 负责将所有任务总结整合为最终报告
 */

import { BaseAgent } from "../baseAgent";
import { llmService } from "../../llmService";
import { REPORT_WRITER_SYSTEM_PROMPT } from "./prompts";
import type {
  ReportWriterInput,
  ReportWriterOutput,
  TodoItem,
} from "@/types/research";

/**
 * 格式化任务总结为提示文本
 */
function formatTaskSummaries(tasks: TodoItem[]): string {
  const completedTasks = tasks.filter(
    (task) => task.status === "completed" && task.summary
  );

  if (completedTasks.length === 0) {
    return "暂无完成的任务总结。";
  }

  return completedTasks
    .map((task) => {
      const sourcesInfo =
        task.sources && task.sources.length > 0
          ? `\n参考来源: ${task.sources.length} 个`
          : "";

      return `## 任务 ${task.id}: ${task.title}
意图: ${task.intent}
${sourcesInfo}

### 总结内容
${task.summary}`;
    })
    .join("\n\n---\n\n");
}

export class ReportWriterAgent extends BaseAgent<
  ReportWriterInput,
  ReportWriterOutput
> {
  readonly name = "ReportWriterAgent";
  readonly description = "整合所有任务总结生成最终研究报告";

  protected async run(input: ReportWriterInput): Promise<ReportWriterOutput> {
    const { topic, tasks } = input;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed" && task.summary
    );

    // 检查是否有完成的任务
    if (completedTasks.length === 0) {
      return {
        report: `# ${topic} 研究报告

## 摘要

由于没有成功完成任何研究任务，无法生成完整报告。

## 建议

1. 检查网络连接
2. 尝试更换搜索引擎
3. 调整研究主题的表述方式

---
*本报告由 AI 研究助手自动生成*`,
      };
    }

    const formattedSummaries = formatTaskSummaries(tasks);

    const prompt = `# 研究主题
${topic}

# 已完成的研究任务
共完成 ${completedTasks.length} 个子任务

${formattedSummaries}

请根据以上研究内容，撰写一份完整的研究报告。`;

    console.log(`[${this.name}] 正在生成研究报告: ${topic}`);
    const report = await llmService.generate(prompt, REPORT_WRITER_SYSTEM_PROMPT);

    // 确保报告不为空
    if (!report.trim()) {
      return {
        report: `# ${topic} 研究报告

## 摘要

报告生成失败，请稍后重试。

---
*本报告由 AI 研究助手自动生成*`,
      };
    }

    return { report };
  }
}

// 导出单例
export const reportWriterAgent = new ReportWriterAgent();
